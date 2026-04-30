import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ─── Users ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CRM: Contacts ─────────────────────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 256 }),
  title: varchar("title", { length: 256 }),
  tags: text("tags"), // JSON array of strings
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "inactive", "lead", "customer"]).default("lead").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ─── CRM: Pipelines ────────────────────────────────────────────────────────
export const pipelines = mysqlTable("pipelines", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pipeline = typeof pipelines.$inferSelect;

// ─── CRM: Pipeline Stages ──────────────────────────────────────────────────
export const pipelineStages = mysqlTable("pipeline_stages", {
  id: int("id").autoincrement().primaryKey(),
  pipelineId: int("pipelineId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  order: int("order").notNull().default(0),
  color: varchar("color", { length: 32 }).default("#3b82f6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PipelineStage = typeof pipelineStages.$inferSelect;

// ─── CRM: Deals ────────────────────────────────────────────────────────────
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  pipelineId: int("pipelineId").notNull(),
  stageId: int("stageId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["open", "won", "lost"]).default("open").notNull(),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;

// ─── Accounting: Accounts (Chart of Accounts) ──────────────────────────────
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  type: mysqlEnum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  subtype: varchar("subtype", { length: 128 }),
  balance: decimal("balance", { precision: 14, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;

// ─── Accounting: Transactions ───────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId"),
  invoiceId: int("invoiceId"),
  type: mysqlEnum("type", ["income", "expense", "transfer", "refund"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  reference: varchar("reference", { length: 256 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;

// ─── Accounting: Invoices ───────────────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  invoiceNumber: varchar("invoiceNumber", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0.00"),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  notes: text("notes"),
  items: text("items"), // JSON array of line items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;

// ─── Banking: Connected Bank Accounts (Plaid) ──────────────────────────────
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plaidItemId: varchar("plaidItemId", { length: 256 }),
  plaidAccessToken: varchar("plaidAccessToken", { length: 512 }),
  institutionName: varchar("institutionName", { length: 256 }),
  institutionId: varchar("institutionId", { length: 128 }),
  accountName: varchar("accountName", { length: 256 }),
  accountMask: varchar("accountMask", { length: 8 }),
  accountType: varchar("accountType", { length: 64 }),
  currentBalance: decimal("currentBalance", { precision: 14, scale: 2 }),
  availableBalance: decimal("availableBalance", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  lastSynced: timestamp("lastSynced"),
  status: mysqlEnum("status", ["active", "disconnected", "error"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;

// ─── Payments: Payment Methods & Processing ─────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contactId: int("contactId"),
  invoiceId: int("invoiceId"),
  method: mysqlEnum("method", ["ach", "wire", "rtp", "credit_card", "instant"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["initiated", "pending", "processing", "settled", "failed", "reversed"]).default("initiated").notNull(),
  transactionNumber: varchar("transactionNumber", { length: 256 }),
  trackingNumber: varchar("trackingNumber", { length: 256 }),
  modernTreasuryId: varchar("modernTreasuryId", { length: 256 }),
  cardLast4: varchar("cardLast4", { length: 4 }),
  cardBrand: varchar("cardBrand", { length: 32 }),
  description: text("description"),
  metadata: text("metadata"), // JSON
  settledAt: timestamp("settledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;

// ─── AI: Conversations (Memory) ─────────────────────────────────────────────
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }),
  context: text("context"), // system prompt / context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;

// ─── AI: Messages ───────────────────────────────────────────────────────────
export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["system", "user", "assistant"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON for extracted data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiMessage = typeof aiMessages.$inferSelect;

// ─── AI: Memory (Long-term) ────────────────────────────────────────────────
export const aiMemory = mysqlTable("ai_memory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 256 }).notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiMemory = typeof aiMemory.$inferSelect;

// ─── Client Agents ──────────────────────────────────────────────────────────
export const clientAgents = mysqlTable("client_agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt"),
  model: varchar("model", { length: 64 }).default("default"),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  trainingData: text("trainingData"), // JSON: file URLs, scraped content refs
  webAccessEnabled: boolean("webAccessEnabled").default(true),
  deploymentUrl: varchar("deploymentUrl", { length: 512 }),
  clientName: varchar("clientName", { length: 256 }),
  monthlyFee: decimal("monthlyFee", { precision: 10, scale: 2 }).default("0.00"),
  totalInteractions: int("totalInteractions").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientAgent = typeof clientAgents.$inferSelect;

// ─── Agent Training Sources ─────────────────────────────────────────────────
export const agentTrainingSources = mysqlTable("agent_training_sources", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  type: mysqlEnum("type", ["file", "url", "text"]).notNull(),
  name: varchar("name", { length: 256 }),
  content: text("content"), // text content or URL
  fileUrl: varchar("fileUrl", { length: 512 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  processedContent: text("processedContent"), // extracted/scraped text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentTrainingSource = typeof agentTrainingSources.$inferSelect;

// ─── Client Websites ────────────────────────────────────────────────────────
export const clientWebsites = mysqlTable("client_websites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  domain: varchar("domain", { length: 256 }),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "published", "paused"]).default("draft").notNull(),
  template: varchar("template", { length: 128 }),
  pages: text("pages"), // JSON array of page configs
  chatbotEnabled: boolean("chatbotEnabled").default(false),
  chatbotAgentId: int("chatbotAgentId"),
  clientName: varchar("clientName", { length: 256 }),
  monthlyFee: decimal("monthlyFee", { precision: 10, scale: 2 }).default("0.00"),
  totalVisits: int("totalVisits").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientWebsite = typeof clientWebsites.$inferSelect;

// ─── Analytics Events ───────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityType: mysqlEnum("entityType", ["agent", "website"]).notNull(),
  entityId: int("entityId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(), // page_view, chat_message, error, etc.
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// ─── Client Billing ─────────────────────────────────────────────────────────
export const clientBilling = mysqlTable("client_billing", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientName: varchar("clientName", { length: 256 }).notNull(),
  entityType: mysqlEnum("entityType", ["agent", "website"]).notNull(),
  entityId: int("entityId").notNull(),
  monthlyAmount: decimal("monthlyAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
  lastBilledDate: timestamp("lastBilledDate"),
  nextBillingDate: timestamp("nextBillingDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientBilling = typeof clientBilling.$inferSelect;

// ─── Stripe: Customers ─────────────────────────────────────────────────────
export const stripeCustomers = mysqlTable("stripe_customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeCustomer = typeof stripeCustomers.$inferSelect;

// ─── Stripe: Products (local catalog) ──────────────────────────────────────
export const stripeProducts = mysqlTable("stripe_products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeProductId: varchar("stripeProductId", { length: 256 }),
  stripePriceId: varchar("stripePriceId", { length: 256 }),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["one_time", "subscription"]).default("one_time").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  interval: mysqlEnum("interval", ["month", "year", "week"]).default("month"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeProduct = typeof stripeProducts.$inferSelect;

// ─── Stripe: Orders / Purchases ────────────────────────────────────────────
export const stripeOrders = mysqlTable("stripe_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  productId: int("productId"),
  customerEmail: varchar("customerEmail", { length: 320 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeOrder = typeof stripeOrders.$inferSelect;

// ─── Stripe: Subscriptions ─────────────────────────────────────────────────
export const stripeSubscriptions = mysqlTable("stripe_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 256 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  productId: int("productId"),
  status: varchar("status", { length: 64 }).default("active"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;
