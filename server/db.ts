import { eq, and, desc, asc, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  contacts, type Contact,
  pipelines, pipelineStages, deals,
  accounts, transactions, invoices,
  bankAccounts, payments,
  aiConversations, aiMessages, aiMemory,
  clientAgents, agentTrainingSources,
  clientWebsites,
  analyticsEvents, clientBilling,
  stripeCustomers, stripeProducts, stripeOrders, stripeSubscriptions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── CRM: Contacts ─────────────────────────────────────────────────────────

export async function getContacts(userId: number, search?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(contacts.userId, userId)];
  if (search) {
    conditions.push(
      or(
        like(contacts.firstName, `%${search}%`),
        like(contacts.lastName, `%${search}%`),
        like(contacts.email, `%${search}%`),
        like(contacts.company, `%${search}%`),
      )!
    );
  }
  return db.select().from(contacts).where(and(...conditions)).orderBy(desc(contacts.updatedAt));
}

export async function getContactById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId))).limit(1);
  return result[0];
}

export async function createContact(data: Omit<Contact, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(contacts).values(data);
  return result[0].insertId;
}

export async function updateContact(id: number, userId: number, data: Partial<Contact>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contacts).set(data).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

export async function deleteContact(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.userId, userId)));
}

// ─── CRM: Pipelines ────────────────────────────────────────────────────────

export async function getPipelines(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelines).where(eq(pipelines.userId, userId)).orderBy(desc(pipelines.createdAt));
}

export async function createPipeline(userId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(pipelines).values({ userId, name, description });
  const pipelineId = result[0].insertId;
  // Create default stages
  const defaultStages = [
    { pipelineId, name: "New Lead", order: 0, color: "#3b82f6" },
    { pipelineId, name: "Contacted", order: 1, color: "#8b5cf6" },
    { pipelineId, name: "Proposal", order: 2, color: "#f59e0b" },
    { pipelineId, name: "Negotiation", order: 3, color: "#f97316" },
    { pipelineId, name: "Closed Won", order: 4, color: "#22c55e" },
    { pipelineId, name: "Closed Lost", order: 5, color: "#ef4444" },
  ];
  for (const stage of defaultStages) {
    await db.insert(pipelineStages).values(stage);
  }
  return pipelineId;
}

export async function getPipelineStages(pipelineId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineStages).where(eq(pipelineStages.pipelineId, pipelineId)).orderBy(asc(pipelineStages.order));
}

export async function deletePipeline(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pipelineStages).where(eq(pipelineStages.pipelineId, id));
  await db.delete(deals).where(eq(deals.pipelineId, id));
  await db.delete(pipelines).where(and(eq(pipelines.id, id), eq(pipelines.userId, userId)));
}

// ─── CRM: Deals ────────────────────────────────────────────────────────────

export async function getDeals(userId: number, pipelineId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(deals.userId, userId)];
  if (pipelineId) conditions.push(eq(deals.pipelineId, pipelineId));
  return db.select().from(deals).where(and(...conditions)).orderBy(desc(deals.updatedAt));
}

export async function createDeal(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(deals).values(data);
  return result[0].insertId;
}

export async function updateDeal(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(deals).set(data).where(and(eq(deals.id, id), eq(deals.userId, userId)));
}

export async function deleteDeal(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(deals).where(and(eq(deals.id, id), eq(deals.userId, userId)));
}

// ─── Accounting: Accounts ───────────────────────────────────────────────────

export async function getAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts).where(eq(accounts.userId, userId)).orderBy(asc(accounts.type), asc(accounts.name));
}

export async function createAccount(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(accounts).values(data);
  return result[0].insertId;
}

export async function updateAccount(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(accounts).set(data).where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
}

// ─── Accounting: Transactions ───────────────────────────────────────────────

export async function getTransactions(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.transactionDate)).limit(limit);
}

export async function createTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(transactions).values(data);
  return result[0].insertId;
}

export async function updateTransaction(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

// ─── Accounting: Invoices ───────────────────────────────────────────────────

export async function getInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId))).limit(1);
  return result[0];
}

export async function createInvoice(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(invoices).values(data);
  return result[0].insertId;
}

export async function updateInvoice(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(invoices).set(data).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
}

// ─── Banking ────────────────────────────────────────────────────────────────

export async function getBankAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bankAccounts).where(eq(bankAccounts.userId, userId)).orderBy(desc(bankAccounts.createdAt));
}

export async function createBankAccount(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(bankAccounts).values(data);
  return result[0].insertId;
}

export async function updateBankAccount(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(bankAccounts).set(data).where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)));
}

// ─── Payments ───────────────────────────────────────────────────────────────

export async function getPayments(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(limit);
}

export async function createPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(payments).values(data);
  return result[0].insertId;
}

export async function updatePayment(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(payments).set(data).where(and(eq(payments.id, id), eq(payments.userId, userId)));
}

// ─── AI: Conversations & Messages ───────────────────────────────────────────

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(desc(aiConversations.updatedAt));
}

export async function createConversation(userId: number, title?: string, context?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(aiConversations).values({ userId, title: title || "New Conversation", context });
  return result[0].insertId;
}

export async function getMessages(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(asc(aiMessages.createdAt));
}

export async function addMessage(conversationId: number, role: "system" | "user" | "assistant", content: string, metadata?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(aiMessages).values({ conversationId, role, content, metadata });
  await db.update(aiConversations).set({ updatedAt: new Date() }).where(eq(aiConversations.id, conversationId));
}

export async function deleteConversation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(aiMessages).where(eq(aiMessages.conversationId, id));
  await db.delete(aiConversations).where(and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)));
}

// ─── AI: Memory ─────────────────────────────────────────────────────────────

export async function getMemories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiMemory).where(eq(aiMemory.userId, userId)).orderBy(desc(aiMemory.updatedAt));
}

export async function upsertMemory(userId: number, key: string, value: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(aiMemory).where(and(eq(aiMemory.userId, userId), eq(aiMemory.key, key))).limit(1);
  if (existing.length > 0) {
    await db.update(aiMemory).set({ value, category, updatedAt: new Date() }).where(eq(aiMemory.id, existing[0].id));
  } else {
    await db.insert(aiMemory).values({ userId, key, value, category });
  }
}

export async function deleteMemory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(aiMemory).where(and(eq(aiMemory.id, id), eq(aiMemory.userId, userId)));
}

// ─── Client Agents ──────────────────────────────────────────────────────────

export async function getClientAgents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientAgents).where(eq(clientAgents.userId, userId)).orderBy(desc(clientAgents.updatedAt));
}

export async function getClientAgentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientAgents).where(and(eq(clientAgents.id, id), eq(clientAgents.userId, userId))).limit(1);
  return result[0];
}

export async function createClientAgent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clientAgents).values(data);
  return result[0].insertId;
}

export async function updateClientAgent(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clientAgents).set(data).where(and(eq(clientAgents.id, id), eq(clientAgents.userId, userId)));
}

export async function deleteClientAgent(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(agentTrainingSources).where(eq(agentTrainingSources.agentId, id));
  await db.delete(clientAgents).where(and(eq(clientAgents.id, id), eq(clientAgents.userId, userId)));
}

// ─── Agent Training Sources ─────────────────────────────────────────────────

export async function getTrainingSources(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentTrainingSources).where(eq(agentTrainingSources.agentId, agentId)).orderBy(desc(agentTrainingSources.createdAt));
}

export async function addTrainingSource(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(agentTrainingSources).values(data);
  return result[0].insertId;
}

export async function updateTrainingSource(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(agentTrainingSources).set(data).where(eq(agentTrainingSources.id, id));
}

export async function deleteTrainingSource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(agentTrainingSources).where(eq(agentTrainingSources.id, id));
}

// ─── Client Websites ────────────────────────────────────────────────────────

export async function getClientWebsites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientWebsites).where(eq(clientWebsites.userId, userId)).orderBy(desc(clientWebsites.updatedAt));
}

export async function getClientWebsiteById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clientWebsites).where(and(eq(clientWebsites.id, id), eq(clientWebsites.userId, userId))).limit(1);
  return result[0];
}

export async function createClientWebsite(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clientWebsites).values(data);
  return result[0].insertId;
}

export async function updateClientWebsite(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clientWebsites).set(data).where(and(eq(clientWebsites.id, id), eq(clientWebsites.userId, userId)));
}

export async function deleteClientWebsite(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(clientWebsites).where(and(eq(clientWebsites.id, id), eq(clientWebsites.userId, userId)));
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export async function logAnalyticsEvent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(analyticsEvents).values(data);
}

export async function getAnalyticsEvents(userId: number, entityType?: string, entityId?: number, limit = 500) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(analyticsEvents.userId, userId)];
  if (entityType) conditions.push(eq(analyticsEvents.entityType, entityType as any));
  if (entityId) conditions.push(eq(analyticsEvents.entityId, entityId));
  return db.select().from(analyticsEvents).where(and(...conditions)).orderBy(desc(analyticsEvents.createdAt)).limit(limit);
}

export async function getAnalyticsSummary(userId: number) {
  const db = await getDb();
  if (!db) return { totalAgents: 0, totalWebsites: 0, totalEvents: 0, totalRevenue: "0.00" };
  const [agentCount] = await db.select({ count: sql<number>`count(*)` }).from(clientAgents).where(eq(clientAgents.userId, userId));
  const [websiteCount] = await db.select({ count: sql<number>`count(*)` }).from(clientWebsites).where(eq(clientWebsites.userId, userId));
  const [eventCount] = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvents).where(eq(analyticsEvents.userId, userId));
  const [revenue] = await db.select({ total: sql<string>`COALESCE(SUM(monthlyAmount), 0)` }).from(clientBilling).where(and(eq(clientBilling.userId, userId), eq(clientBilling.status, "active")));
  return {
    totalAgents: agentCount?.count ?? 0,
    totalWebsites: websiteCount?.count ?? 0,
    totalEvents: eventCount?.count ?? 0,
    totalRevenue: revenue?.total ?? "0.00",
  };
}

// ─── Client Billing ─────────────────────────────────────────────────────────

export async function getClientBillings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientBilling).where(eq(clientBilling.userId, userId)).orderBy(desc(clientBilling.createdAt));
}

export async function createClientBilling(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clientBilling).values(data);
  return result[0].insertId;
}

export async function updateClientBilling(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clientBilling).set(data).where(and(eq(clientBilling.id, id), eq(clientBilling.userId, userId)));
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { contacts: 0, deals: 0, dealValue: "0.00", invoices: 0, invoiceTotal: "0.00", payments: 0, agents: 0, websites: 0 };
  const [contactCount] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.userId, userId));
  const [dealStats] = await db.select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(SUM(value), 0)` }).from(deals).where(and(eq(deals.userId, userId), eq(deals.status, "open")));
  const [invoiceStats] = await db.select({ count: sql<number>`count(*)`, total: sql<string>`COALESCE(SUM(total), 0)` }).from(invoices).where(eq(invoices.userId, userId));
  const [paymentCount] = await db.select({ count: sql<number>`count(*)` }).from(payments).where(eq(payments.userId, userId));
  const [agentCount] = await db.select({ count: sql<number>`count(*)` }).from(clientAgents).where(eq(clientAgents.userId, userId));
  const [websiteCount] = await db.select({ count: sql<number>`count(*)` }).from(clientWebsites).where(eq(clientWebsites.userId, userId));
  return {
    contacts: contactCount?.count ?? 0,
    deals: dealStats?.count ?? 0,
    dealValue: dealStats?.total ?? "0.00",
    invoices: invoiceStats?.count ?? 0,
    invoiceTotal: invoiceStats?.total ?? "0.00",
    payments: paymentCount?.count ?? 0,
    agents: agentCount?.count ?? 0,
    websites: websiteCount?.count ?? 0,
  };
}

// ─── Stripe: Customers ─────────────────────────────────────────────────────

export async function getStripeCustomer(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, userId)).limit(1);
  return result[0];
}

export async function upsertStripeCustomer(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, userId)).limit(1);
  if (existing.length > 0) {
    await db.update(stripeCustomers).set({ stripeCustomerId }).where(eq(stripeCustomers.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(stripeCustomers).values({ userId, stripeCustomerId });
  return result[0].insertId;
}

// ─── Stripe: Products ──────────────────────────────────────────────────────

export async function getStripeProducts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stripeProducts).where(eq(stripeProducts.userId, userId)).orderBy(desc(stripeProducts.createdAt));
}

export async function getStripeProductById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stripeProducts).where(and(eq(stripeProducts.id, id), eq(stripeProducts.userId, userId))).limit(1);
  return result[0];
}

export async function createStripeProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(stripeProducts).values(data);
  return result[0].insertId;
}

export async function updateStripeProduct(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(stripeProducts).set(data).where(and(eq(stripeProducts.id, id), eq(stripeProducts.userId, userId)));
}

export async function deleteStripeProduct(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(stripeProducts).set({ isActive: false }).where(and(eq(stripeProducts.id, id), eq(stripeProducts.userId, userId)));
}

// ─── Stripe: Orders ────────────────────────────────────────────────────────

export async function getStripeOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stripeOrders).where(eq(stripeOrders.userId, userId)).orderBy(desc(stripeOrders.createdAt));
}

export async function createStripeOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(stripeOrders).values(data);
  return result[0].insertId;
}

export async function updateStripeOrderBySession(sessionId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(stripeOrders).set(data).where(eq(stripeOrders.stripeSessionId, sessionId));
}

// ─── Stripe: Subscriptions ─────────────────────────────────────────────────

export async function getStripeSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stripeSubscriptions).where(eq(stripeSubscriptions.userId, userId)).orderBy(desc(stripeSubscriptions.createdAt));
}

export async function upsertStripeSubscription(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(stripeSubscriptions).where(eq(stripeSubscriptions.stripeSubscriptionId, data.stripeSubscriptionId)).limit(1);
  if (existing.length > 0) {
    await db.update(stripeSubscriptions).set(data).where(eq(stripeSubscriptions.id, existing[0].id));
    return existing[0].id;
  }
  const result = await db.insert(stripeSubscriptions).values(data);
  return result[0].insertId;
}

export async function updateStripeSubscription(stripeSubId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(stripeSubscriptions).set(data).where(eq(stripeSubscriptions.stripeSubscriptionId, stripeSubId));
}
