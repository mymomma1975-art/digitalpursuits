import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    totalContacts: 5,
    totalDeals: 3,
    totalInvoices: 2,
    totalPayments: 1,
    totalAgents: 2,
    totalWebsites: 1,
    recentTransactions: [],
    revenue: "10000.00",
  }),
  getContacts: vi.fn().mockResolvedValue([
    { id: 1, firstName: "John", lastName: "Doe", email: "john@test.com", status: "lead" },
  ]),
  getContactById: vi.fn().mockResolvedValue({ id: 1, firstName: "John", lastName: "Doe", email: "john@test.com" }),
  createContact: vi.fn().mockResolvedValue(1),
  updateContact: vi.fn().mockResolvedValue(undefined),
  deleteContact: vi.fn().mockResolvedValue(undefined),
  getPipelines: vi.fn().mockResolvedValue([{ id: 1, name: "Sales Pipeline" }]),
  createPipeline: vi.fn().mockResolvedValue(1),
  getPipelineStages: vi.fn().mockResolvedValue([{ id: 1, name: "Lead" }]),
  deletePipeline: vi.fn().mockResolvedValue(undefined),
  getDeals: vi.fn().mockResolvedValue([{ id: 1, title: "Big Deal", value: "5000" }]),
  createDeal: vi.fn().mockResolvedValue(1),
  updateDeal: vi.fn().mockResolvedValue(undefined),
  deleteDeal: vi.fn().mockResolvedValue(undefined),
  getAccounts: vi.fn().mockResolvedValue([{ id: 1, name: "Cash", type: "asset", balance: "10000" }]),
  createAccount: vi.fn().mockResolvedValue(1),
  updateAccount: vi.fn().mockResolvedValue(undefined),
  getTransactions: vi.fn().mockResolvedValue([{ id: 1, type: "income", amount: "5000" }]),
  createTransaction: vi.fn().mockResolvedValue(1),
  updateTransaction: vi.fn().mockResolvedValue(undefined),
  getInvoices: vi.fn().mockResolvedValue([{ id: 1, invoiceNumber: "INV-001", total: "1000" }]),
  getInvoiceById: vi.fn().mockResolvedValue({ id: 1, invoiceNumber: "INV-001" }),
  createInvoice: vi.fn().mockResolvedValue(1),
  updateInvoice: vi.fn().mockResolvedValue(undefined),
  getBankAccounts: vi.fn().mockResolvedValue([{ id: 1, institutionName: "Chase" }]),
  createBankAccount: vi.fn().mockResolvedValue(1),
  updateBankAccount: vi.fn().mockResolvedValue(undefined),
  getPayments: vi.fn().mockResolvedValue([{ id: 1, method: "ach", amount: "500" }]),
  createPayment: vi.fn().mockResolvedValue(1),
  updatePayment: vi.fn().mockResolvedValue(undefined),
  getConversations: vi.fn().mockResolvedValue([{ id: 1, title: "Test Chat" }]),
  createConversation: vi.fn().mockResolvedValue(1),
  deleteConversation: vi.fn().mockResolvedValue(undefined),
  getMessages: vi.fn().mockResolvedValue([]),
  addMessage: vi.fn().mockResolvedValue(1),
  getMemories: vi.fn().mockResolvedValue([]),
  upsertMemory: vi.fn().mockResolvedValue(undefined),
  deleteMemory: vi.fn().mockResolvedValue(undefined),
  getClientAgents: vi.fn().mockResolvedValue([{ id: 1, name: "Support Bot", status: "active" }]),
  getClientAgentById: vi.fn().mockResolvedValue({ id: 1, name: "Support Bot", systemPrompt: "Help users", totalInteractions: 5 }),
  createClientAgent: vi.fn().mockResolvedValue(1),
  updateClientAgent: vi.fn().mockResolvedValue(undefined),
  deleteClientAgent: vi.fn().mockResolvedValue(undefined),
  getTrainingSources: vi.fn().mockResolvedValue([]),
  addTrainingSource: vi.fn().mockResolvedValue(1),
  updateTrainingSource: vi.fn().mockResolvedValue(undefined),
  deleteTrainingSource: vi.fn().mockResolvedValue(undefined),
  getClientWebsites: vi.fn().mockResolvedValue([{ id: 1, name: "Client Site" }]),
  getClientWebsiteById: vi.fn().mockResolvedValue({ id: 1, name: "Client Site", chatbotAgentId: 1 }),
  createClientWebsite: vi.fn().mockResolvedValue(1),
  updateClientWebsite: vi.fn().mockResolvedValue(undefined),
  deleteClientWebsite: vi.fn().mockResolvedValue(undefined),
  getAnalyticsSummary: vi.fn().mockResolvedValue({ totalAgents: 2, totalWebsites: 1 }),
  getAnalyticsEvents: vi.fn().mockResolvedValue([]),
  logAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
  getClientBillings: vi.fn().mockResolvedValue([]),
  createClientBilling: vi.fn().mockResolvedValue(1),
  updateClientBilling: vi.fn().mockResolvedValue(undefined),
  getStripeProducts: vi.fn().mockResolvedValue([
    { id: 1, name: "Pro Plan", type: "subscription", amount: "29.99", currency: "USD", interval: "month", isActive: true, stripeProductId: "prod_test", stripePriceId: "price_test" },
  ]),
  getStripeProductById: vi.fn().mockResolvedValue({ id: 1, name: "Pro Plan", type: "subscription", amount: "29.99", currency: "USD", interval: "month", stripeProductId: "prod_test", stripePriceId: "price_test" }),
  createStripeProduct: vi.fn().mockResolvedValue(1),
  updateStripeProduct: vi.fn().mockResolvedValue(undefined),
  deleteStripeProduct: vi.fn().mockResolvedValue(undefined),
  getStripeOrders: vi.fn().mockResolvedValue([
    { id: 1, status: "completed", amount: "29.99", customerEmail: "test@test.com" },
  ]),
  createStripeOrder: vi.fn().mockResolvedValue(1),
  updateStripeOrderBySession: vi.fn().mockResolvedValue(undefined),
  getStripeSubscriptions: vi.fn().mockResolvedValue([
    { id: 1, stripeSubscriptionId: "sub_test", status: "active", cancelAtPeriodEnd: false },
  ]),
  upsertStripeSubscription: vi.fn().mockResolvedValue(1),
  updateStripeSubscription: vi.fn().mockResolvedValue(undefined),
  getStripeCustomer: vi.fn().mockResolvedValue({ id: 1, stripeCustomerId: "cus_test" }),
  upsertStripeCustomer: vi.fn().mockResolvedValue(1),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Mock AI response" } }],
  }),
}));

// Mock Stripe helper
vi.mock("./stripe", () => ({
  getStripe: vi.fn(),
  getOrCreateStripeCustomer: vi.fn().mockResolvedValue("cus_test_123"),
  createStripeProduct: vi.fn().mockResolvedValue({ productId: "prod_test_123", priceId: "price_test_123" }),
  createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test", sessionId: "cs_test_123" }),
  retrieveCheckoutSession: vi.fn().mockResolvedValue({ id: "cs_test_123" }),
  listCustomerSubscriptions: vi.fn().mockResolvedValue({ data: [] }),
  cancelSubscription: vi.fn().mockResolvedValue({ id: "sub_test" }),
  listCustomerPayments: vi.fn().mockResolvedValue({ data: [] }),
  constructWebhookEvent: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createCaller() {
  return appRouter.createCaller(createAuthContext());
}

// ─── Dashboard Tests ────────────────────────────────────────────────────────
describe("dashboard", () => {
  it("returns dashboard stats", async () => {
    const caller = createCaller();
    const result = await caller.dashboard.stats();
    expect(result).toHaveProperty("totalContacts");
    expect(result).toHaveProperty("totalDeals");
    expect(result).toHaveProperty("totalInvoices");
    expect(result).toHaveProperty("revenue");
  });
});

// ─── CRM: Contacts Tests ───────────────────────────────────────────────────
describe("contacts", () => {
  it("lists contacts", async () => {
    const caller = createCaller();
    const result = await caller.contacts.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("firstName");
  });

  it("creates a contact", async () => {
    const caller = createCaller();
    const result = await caller.contacts.create({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@test.com",
      status: "lead",
    });
    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("gets contact by id", async () => {
    const caller = createCaller();
    const result = await caller.contacts.getById({ id: 1 });
    expect(result).toHaveProperty("firstName", "John");
  });

  it("updates a contact", async () => {
    const caller = createCaller();
    const result = await caller.contacts.update({ id: 1, firstName: "Updated" });
    expect(result).toEqual({ success: true });
  });

  it("deletes a contact", async () => {
    const caller = createCaller();
    const result = await caller.contacts.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

// ─── CRM: Pipelines Tests ──────────────────────────────────────────────────
describe("pipelines", () => {
  it("lists pipelines", async () => {
    const caller = createCaller();
    const result = await caller.pipelines.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a pipeline", async () => {
    const caller = createCaller();
    const result = await caller.pipelines.create({ name: "New Pipeline" });
    expect(result).toHaveProperty("id");
  });

  it("gets pipeline stages", async () => {
    const caller = createCaller();
    const result = await caller.pipelines.stages({ pipelineId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("deletes a pipeline", async () => {
    const caller = createCaller();
    const result = await caller.pipelines.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

// ─── CRM: Deals Tests ──────────────────────────────────────────────────────
describe("deals", () => {
  it("lists deals", async () => {
    const caller = createCaller();
    const result = await caller.deals.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a deal", async () => {
    const caller = createCaller();
    const result = await caller.deals.create({
      title: "Big Deal",
      pipelineId: 1,
      stageId: 1,
      value: "10000",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates a deal", async () => {
    const caller = createCaller();
    const result = await caller.deals.update({ id: 1, status: "won" });
    expect(result).toEqual({ success: true });
  });

  it("deletes a deal", async () => {
    const caller = createCaller();
    const result = await caller.deals.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

// ─── Accounting: Accounts Tests ─────────────────────────────────────────────
describe("accounts", () => {
  it("lists accounts", async () => {
    const caller = createCaller();
    const result = await caller.accounts.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("type", "asset");
  });

  it("creates an account", async () => {
    const caller = createCaller();
    const result = await caller.accounts.create({
      name: "Checking",
      type: "asset",
      balance: "5000",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates an account", async () => {
    const caller = createCaller();
    const result = await caller.accounts.update({ id: 1, balance: "15000" });
    expect(result).toEqual({ success: true });
  });
});

// ─── Accounting: Transactions Tests ─────────────────────────────────────────
describe("transactions", () => {
  it("lists transactions", async () => {
    const caller = createCaller();
    const result = await caller.transactions.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a transaction", async () => {
    const caller = createCaller();
    const result = await caller.transactions.create({
      type: "income",
      amount: "5000",
      category: "Sales",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates a transaction", async () => {
    const caller = createCaller();
    const result = await caller.transactions.update({ id: 1, status: "completed" });
    expect(result).toEqual({ success: true });
  });
});

// ─── Accounting: Invoices Tests ─────────────────────────────────────────────
describe("invoices", () => {
  it("lists invoices", async () => {
    const caller = createCaller();
    const result = await caller.invoices.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates an invoice", async () => {
    const caller = createCaller();
    const result = await caller.invoices.create({
      invoiceNumber: "INV-002",
      total: "2500",
      status: "draft",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates an invoice", async () => {
    const caller = createCaller();
    const result = await caller.invoices.update({ id: 1, status: "paid" });
    expect(result).toEqual({ success: true });
  });
});

// ─── Banking Tests ──────────────────────────────────────────────────────────
describe("banking", () => {
  it("lists bank accounts", async () => {
    const caller = createCaller();
    const result = await caller.banking.accounts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("connects a bank account", async () => {
    const caller = createCaller();
    const result = await caller.banking.connectAccount({
      institutionName: "Chase",
      accountName: "Checking",
      accountType: "checking",
    });
    expect(result).toHaveProperty("id");
  });

  it("syncs a bank account", async () => {
    const caller = createCaller();
    const result = await caller.banking.syncAccount({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

// ─── Payments Tests ─────────────────────────────────────────────────────────
describe("payments", () => {
  it("lists payments", async () => {
    const caller = createCaller();
    const result = await caller.payments.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates an ACH payment with tracking number", async () => {
    const caller = createCaller();
    const result = await caller.payments.create({
      method: "ach",
      amount: "1500",
      description: "Vendor payment",
    });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("transactionNumber");
    expect(result).toHaveProperty("trackingNumber");
    expect(result.transactionNumber).toMatch(/^TXN-/);
    expect(result.trackingNumber).toMatch(/^TRK-/);
  });

  it("creates a wire transfer", async () => {
    const caller = createCaller();
    const result = await caller.payments.create({
      method: "wire",
      amount: "25000",
    });
    expect(result).toHaveProperty("transactionNumber");
  });

  it("creates a credit card payment", async () => {
    const caller = createCaller();
    const result = await caller.payments.create({
      method: "credit_card",
      amount: "99.99",
      cardLast4: "4242",
      cardBrand: "visa",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates payment status", async () => {
    const caller = createCaller();
    const result = await caller.payments.updateStatus({ id: 1, status: "settled" });
    expect(result).toEqual({ success: true });
  });
});

// ─── AI Assistant Tests ─────────────────────────────────────────────────────
describe("ai", () => {
  it("lists conversations", async () => {
    const caller = createCaller();
    const result = await caller.ai.conversations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a conversation", async () => {
    const caller = createCaller();
    const result = await caller.ai.createConversation({ title: "Test Chat" });
    expect(result).toHaveProperty("id");
  });

  it("sends a chat message and gets AI response", async () => {
    const caller = createCaller();
    const result = await caller.ai.chat({
      conversationId: 1,
      message: "Hello, help me with my business",
      mode: "general",
    });
    expect(result).toHaveProperty("content");
    expect(typeof result.content).toBe("string");
  });

  it("lists memories", async () => {
    const caller = createCaller();
    const result = await caller.ai.memories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("saves a memory", async () => {
    const caller = createCaller();
    const result = await caller.ai.saveMemory({
      key: "business_name",
      value: "Acme Corp",
      category: "business",
    });
    expect(result).toEqual({ success: true });
  });

  it("deletes a memory", async () => {
    const caller = createCaller();
    const result = await caller.ai.deleteMemory({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("deletes a conversation", async () => {
    const caller = createCaller();
    const result = await caller.ai.deleteConversation({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

// ─── Client Agents Tests ────────────────────────────────────────────────────
describe("agents", () => {
  it("lists agents", async () => {
    const caller = createCaller();
    const result = await caller.agents.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates an agent", async () => {
    const caller = createCaller();
    const result = await caller.agents.create({
      name: "Customer Support Bot",
      description: "Handles customer queries",
      systemPrompt: "You are a helpful support agent",
      clientName: "Acme Corp",
      monthlyFee: "99.99",
      webAccessEnabled: true,
    });
    expect(result).toHaveProperty("id");
  });

  it("gets agent by id", async () => {
    const caller = createCaller();
    const result = await caller.agents.getById({ id: 1 });
    expect(result).toHaveProperty("name", "Support Bot");
  });

  it("updates an agent", async () => {
    const caller = createCaller();
    const result = await caller.agents.update({ id: 1, status: "active" });
    expect(result).toEqual({ success: true });
  });

  it("deletes an agent", async () => {
    const caller = createCaller();
    const result = await caller.agents.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("adds a text training source", async () => {
    const caller = createCaller();
    const result = await caller.agents.addTrainingSource({
      agentId: 1,
      type: "text",
      name: "FAQ",
      content: "Q: What is your return policy? A: 30 days.",
    });
    expect(result).toHaveProperty("id");
  });

  it("adds a URL training source (web access)", async () => {
    const caller = createCaller();
    const result = await caller.agents.addTrainingSource({
      agentId: 1,
      type: "url",
      name: "Docs",
      content: "https://example.com/docs",
    });
    expect(result).toHaveProperty("id");
  });

  it("lists training sources", async () => {
    const caller = createCaller();
    const result = await caller.agents.trainingSources({ agentId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("deletes a training source", async () => {
    const caller = createCaller();
    const result = await caller.agents.deleteTrainingSource({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("tests agent chat", async () => {
    const caller = createCaller();
    const result = await caller.agents.testChat({
      agentId: 1,
      message: "What is your return policy?",
    });
    expect(result).toHaveProperty("content");
  });
});

// ─── Client Websites Tests ──────────────────────────────────────────────────
describe("websites", () => {
  it("lists websites", async () => {
    const caller = createCaller();
    const result = await caller.websites.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a website", async () => {
    const caller = createCaller();
    const result = await caller.websites.create({
      name: "Client Portfolio",
      domain: "client.com",
      clientName: "Acme Corp",
      monthlyFee: "49.99",
      chatbotEnabled: true,
    });
    expect(result).toHaveProperty("id");
  });

  it("updates a website", async () => {
    const caller = createCaller();
    const result = await caller.websites.update({ id: 1, status: "published" });
    expect(result).toEqual({ success: true });
  });

  it("deletes a website", async () => {
    const caller = createCaller();
    const result = await caller.websites.delete({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("gets embed code", async () => {
    const caller = createCaller();
    const result = await caller.websites.getEmbedCode({ websiteId: 1 });
    expect(result).toHaveProperty("embedCode");
    expect(result.embedCode).toContain("script");
    expect(result.embedCode).toContain("widget.js");
  });
});

// ─── Analytics Tests ────────────────────────────────────────────────────────
describe("analytics", () => {
  it("gets analytics summary", async () => {
    const caller = createCaller();
    const result = await caller.analytics.summary();
    expect(result).toHaveProperty("totalAgents");
  });

  it("lists analytics events", async () => {
    const caller = createCaller();
    const result = await caller.analytics.events();
    expect(Array.isArray(result)).toBe(true);
  });

  it("logs an analytics event", async () => {
    const caller = createCaller();
    const result = await caller.analytics.logEvent({
      entityType: "agent",
      entityId: 1,
      eventType: "interaction",
    });
    expect(result).toEqual({ success: true });
  });
});

// ─── Billing Tests ──────────────────────────────────────────────────────────
describe("billing", () => {
  it("lists billings", async () => {
    const caller = createCaller();
    const result = await caller.billing.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a billing entry", async () => {
    const caller = createCaller();
    const result = await caller.billing.create({
      clientName: "Acme Corp",
      entityType: "agent",
      entityId: 1,
      monthlyAmount: "99.99",
    });
    expect(result).toHaveProperty("id");
  });

  it("updates a billing entry", async () => {
    const caller = createCaller();
    const result = await caller.billing.update({ id: 1, status: "paused" });
    expect(result).toEqual({ success: true });
  });
});

// ─── Stripe Tests ──────────────────────────────────────────────────────────
describe("stripe", () => {
  it("lists products", async () => {
    const caller = createCaller();
    const result = await caller.stripe.products();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name", "Pro Plan");
  });

  it("gets a product by id", async () => {
    const caller = createCaller();
    const result = await caller.stripe.getProduct({ id: 1 });
    expect(result).toHaveProperty("name", "Pro Plan");
    expect(result).toHaveProperty("stripePriceId", "price_test");
  });

  it("creates a one-time product", async () => {
    const caller = createCaller();
    const result = await caller.stripe.createProduct({
      name: "Website Setup",
      description: "One-time website setup fee",
      type: "one_time",
      amount: "499.99",
    });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("stripeProductId", "prod_test_123");
    expect(result).toHaveProperty("stripePriceId", "price_test_123");
  });

  it("creates a subscription product", async () => {
    const caller = createCaller();
    const result = await caller.stripe.createProduct({
      name: "Monthly AI Agent",
      description: "AI agent hosting",
      type: "subscription",
      amount: "99.99",
      interval: "month",
    });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("stripeProductId");
  });

  it("updates a product", async () => {
    const caller = createCaller();
    const result = await caller.stripe.updateProduct({
      id: 1,
      name: "Pro Plan v2",
      description: "Updated description",
    });
    expect(result).toEqual({ success: true });
  });

  it("deletes (archives) a product", async () => {
    const caller = createCaller();
    const result = await caller.stripe.deleteProduct({ id: 1 });
    expect(result).toEqual({ success: true });
  });

  it("creates a checkout session", async () => {
    const caller = createCaller();
    const result = await caller.stripe.createCheckout({
      productId: 1,
      origin: "https://myapp.com",
    });
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
    expect(result.url).toContain("stripe.com");
  });

  it("lists orders", async () => {
    const caller = createCaller();
    const result = await caller.stripe.orders();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("status", "completed");
  });

  it("lists subscriptions", async () => {
    const caller = createCaller();
    const result = await caller.stripe.subscriptions();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("stripeSubscriptionId", "sub_test");
  });

  it("cancels a subscription", async () => {
    const caller = createCaller();
    const result = await caller.stripe.cancelSubscription({
      stripeSubscriptionId: "sub_test",
    });
    expect(result).toEqual({ success: true });
  });
});
