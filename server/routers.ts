import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import * as stripeHelper from "./stripe";

// ─── Auth Router ────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Dashboard Router ───────────────────────────────────────────────────────
const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    return db.getDashboardStats(ctx.user.id);
  }),
});

// ─── CRM: Contacts Router ──────────────────────────────────────────────────
const contactsRouter = router({
  list: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getContacts(ctx.user.id, input?.search);
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getContactById(input.id, ctx.user.id);
    }),
  create: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().optional(),
      company: z.string().optional(),
      title: z.string().optional(),
      tags: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "lead", "customer"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createContact({
        userId: ctx.user.id,
        firstName: input.firstName,
        lastName: input.lastName ?? null,
        email: input.email || null,
        phone: input.phone ?? null,
        company: input.company ?? null,
        title: input.title ?? null,
        tags: input.tags ?? null,
        notes: input.notes ?? null,
        status: input.status || "lead",
      });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      title: z.string().optional(),
      tags: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "inactive", "lead", "customer"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateContact(id, ctx.user.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteContact(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── CRM: Pipelines Router ─────────────────────────────────────────────────
const pipelinesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getPipelines(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createPipeline(ctx.user.id, input.name, input.description);
      return { id };
    }),
  stages: protectedProcedure
    .input(z.object({ pipelineId: z.number() }))
    .query(async ({ input }) => {
      return db.getPipelineStages(input.pipelineId);
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deletePipeline(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── CRM: Deals Router ─────────────────────────────────────────────────────
const dealsRouter = router({
  list: protectedProcedure
    .input(z.object({ pipelineId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getDeals(ctx.user.id, input?.pipelineId);
    }),
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      pipelineId: z.number(),
      stageId: z.number(),
      contactId: z.number().optional(),
      value: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createDeal({ ...input, userId: ctx.user.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      stageId: z.number().optional(),
      value: z.string().optional(),
      status: z.enum(["open", "won", "lost"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateDeal(id, ctx.user.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteDeal(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Accounting: Accounts Router ────────────────────────────────────────────
const accountsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getAccounts(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
      subtype: z.string().optional(),
      description: z.string().optional(),
      balance: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createAccount({ ...input, userId: ctx.user.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(["asset", "liability", "equity", "revenue", "expense"]).optional(),
      balance: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateAccount(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── Accounting: Transactions Router ────────────────────────────────────────
const transactionsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return db.getTransactions(ctx.user.id, input?.limit);
    }),
  create: protectedProcedure
    .input(z.object({
      type: z.enum(["income", "expense", "transfer", "refund"]),
      amount: z.string(),
      accountId: z.number().optional(),
      invoiceId: z.number().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      reference: z.string().optional(),
      status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createTransaction({ ...input, userId: ctx.user.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateTransaction(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── Accounting: Invoices Router ────────────────────────────────────────────
const invoicesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getInvoices(ctx.user.id);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getInvoiceById(input.id, ctx.user.id);
    }),
  create: protectedProcedure
    .input(z.object({
      invoiceNumber: z.string().min(1),
      contactId: z.number().optional(),
      subtotal: z.string().optional(),
      tax: z.string().optional(),
      total: z.string().optional(),
      dueDate: z.number().optional(),
      notes: z.string().optional(),
      items: z.string().optional(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const data = { ...input, userId: ctx.user.id, dueDate: input.dueDate ? new Date(input.dueDate) : undefined };
      const id = await db.createInvoice(data);
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
      notes: z.string().optional(),
      items: z.string().optional(),
      subtotal: z.string().optional(),
      tax: z.string().optional(),
      total: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateInvoice(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── Banking Router ─────────────────────────────────────────────────────────
const bankingRouter = router({
  accounts: protectedProcedure.query(async ({ ctx }) => {
    return db.getBankAccounts(ctx.user.id);
  }),
  connectAccount: protectedProcedure
    .input(z.object({
      institutionName: z.string(),
      institutionId: z.string().optional(),
      accountName: z.string(),
      accountMask: z.string().optional(),
      accountType: z.string().optional(),
      currentBalance: z.string().optional(),
      availableBalance: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, this would use Plaid Link token exchange
      const id = await db.createBankAccount({
        ...input,
        userId: ctx.user.id,
        plaidItemId: `sandbox_item_${Date.now()}`,
        plaidAccessToken: `sandbox_access_${Date.now()}`,
      });
      return { id };
    }),
  syncAccount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Simulate Plaid sync - in production would call Plaid API
      await db.updateBankAccount(input.id, ctx.user.id, {
        lastSynced: new Date(),
        currentBalance: (Math.random() * 50000 + 5000).toFixed(2),
        availableBalance: (Math.random() * 45000 + 4000).toFixed(2),
      });
      return { success: true };
    }),
});

// ─── Payments Router ────────────────────────────────────────────────────────
const paymentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getPayments(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      method: z.enum(["ach", "wire", "rtp", "credit_card", "instant"]),
      amount: z.string(),
      contactId: z.number().optional(),
      invoiceId: z.number().optional(),
      description: z.string().optional(),
      cardLast4: z.string().optional(),
      cardBrand: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate tracking/transaction numbers
      const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const modernTreasuryId = input.method !== "credit_card" ? `mt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}` : undefined;

      const id = await db.createPayment({
        ...input,
        userId: ctx.user.id,
        transactionNumber,
        trackingNumber,
        modernTreasuryId,
        status: input.method === "credit_card" ? "pending" : "initiated",
      });
      return { id, transactionNumber, trackingNumber };
    }),
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["initiated", "pending", "processing", "settled", "failed", "reversed"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const data: any = { status: input.status };
      if (input.status === "settled") data.settledAt = new Date();
      await db.updatePayment(input.id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── AI Assistant Router ────────────────────────────────────────────────────
const aiRouter = router({
  conversations: protectedProcedure.query(async ({ ctx }) => {
    return db.getConversations(ctx.user.id);
  }),
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional(), context: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createConversation(ctx.user.id, input.title, input.context);
      return { id };
    }),
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteConversation(input.id, ctx.user.id);
      return { success: true };
    }),
  messages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      return db.getMessages(input.conversationId);
    }),
  chat: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1),
      mode: z.enum(["general", "email_extract", "code_generate"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save user message
      await db.addMessage(input.conversationId, "user", input.message);

      // Get conversation history
      const messages = await db.getMessages(input.conversationId);
      // Get user's memories for context
      const memories = await db.getMemories(ctx.user.id);
      const memoryContext = memories.length > 0
        ? `\n\nUser's stored memories:\n${memories.map(m => `- ${m.key}: ${m.value}`).join("\n")}`
        : "";

      let systemPrompt = `You are NexusCommand AI, a powerful business assistant. You help with CRM, accounting, payments, code generation, and business operations. You have memory of past conversations and user preferences.${memoryContext}`;

      if (input.mode === "email_extract") {
        systemPrompt += `\n\nYou are in email extraction mode. Extract payment information, tracking numbers, transfer numbers, transaction IDs, amounts, dates, and sender/recipient details from the provided email content. Return the data in a structured format.`;
      } else if (input.mode === "code_generate") {
        systemPrompt += `\n\nYou are in code generation mode. Generate clean, production-ready code based on the user's requirements. Include comments and explain your approach.`;
      }

      const llmMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.slice(-20).map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ];

      try {
        const response = await invokeLLM({ messages: llmMessages });
        const assistantContent = typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : JSON.stringify(response.choices[0].message.content);

        await db.addMessage(input.conversationId, "assistant", assistantContent);

        // Auto-extract and save memories from the conversation
        if (input.message.toLowerCase().includes("remember") || input.message.toLowerCase().includes("my name") || input.message.toLowerCase().includes("my business")) {
          try {
            const memoryResponse = await invokeLLM({
              messages: [
                { role: "system", content: "Extract key facts to remember from this message. Return JSON: {\"key\": \"short_key\", \"value\": \"fact_to_remember\", \"category\": \"preference|business|personal\"}. If nothing to remember, return {\"key\": \"\", \"value\": \"\"}." },
                { role: "user", content: input.message },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "memory_extract",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      value: { type: "string" },
                      category: { type: "string" },
                    },
                    required: ["key", "value", "category"],
                    additionalProperties: false,
                  },
                },
              },
            });
            const memData = JSON.parse(typeof memoryResponse.choices[0].message.content === "string" ? memoryResponse.choices[0].message.content : "{}");
            if (memData.key && memData.value) {
              await db.upsertMemory(ctx.user.id, memData.key, memData.value, memData.category);
            }
          } catch (e) { /* memory extraction is best-effort */ }
        }

        return { content: assistantContent };
      } catch (error: any) {
        const errorMsg = "I apologize, but I encountered an error processing your request. Please try again.";
        await db.addMessage(input.conversationId, "assistant", errorMsg);
        return { content: errorMsg };
      }
    }),
  // Memory management
  memories: protectedProcedure.query(async ({ ctx }) => {
    return db.getMemories(ctx.user.id);
  }),
  saveMemory: protectedProcedure
    .input(z.object({ key: z.string(), value: z.string(), category: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await db.upsertMemory(ctx.user.id, input.key, input.value, input.category);
      return { success: true };
    }),
  deleteMemory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteMemory(input.id, ctx.user.id);
      return { success: true };
    }),
});

// ─── Client Agents Router ───────────────────────────────────────────────────
const agentsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getClientAgents(ctx.user.id);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getClientAgentById(input.id, ctx.user.id);
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      systemPrompt: z.string().optional(),
      clientName: z.string().optional(),
      monthlyFee: z.string().optional(),
      webAccessEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createClientAgent({ ...input, userId: ctx.user.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      systemPrompt: z.string().optional(),
      status: z.enum(["draft", "active", "paused", "archived"]).optional(),
      clientName: z.string().optional(),
      monthlyFee: z.string().optional(),
      webAccessEnabled: z.boolean().optional(),
      deploymentUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateClientAgent(id, ctx.user.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteClientAgent(input.id, ctx.user.id);
      return { success: true };
    }),
  // Training sources
  trainingSources: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return db.getTrainingSources(input.agentId);
    }),
  addTrainingSource: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      type: z.enum(["file", "url", "text"]),
      name: z.string().optional(),
      content: z.string().optional(),
      fileUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.addTrainingSource(input);

      // If URL type, attempt to scrape content
      if (input.type === "url" && input.content) {
        try {
          await db.updateTrainingSource(id, { status: "processing" });
          // Use LLM to summarize/process the URL content
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a web content processor. Summarize the key information from this URL/content that would be useful for training an AI agent. Be comprehensive but concise." },
              { role: "user", content: `Process this URL for training data: ${input.content}` },
            ],
          });
          const processed = typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : JSON.stringify(response.choices[0].message.content);
          await db.updateTrainingSource(id, { processedContent: processed, status: "completed" });
        } catch (e) {
          await db.updateTrainingSource(id, { status: "failed" });
        }
      } else if (input.type === "text" && input.content) {
        await db.updateTrainingSource(id, { processedContent: input.content, status: "completed" });
      } else if (input.type === "file" && input.fileUrl) {
        await db.updateTrainingSource(id, { status: "completed" });
      }

      return { id };
    }),
  deleteTrainingSource: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteTrainingSource(input.id);
      return { success: true };
    }),
  // Agent chat (for testing)
  testChat: protectedProcedure
    .input(z.object({ agentId: z.number(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const agent = await db.getClientAgentById(input.agentId, ctx.user.id);
      if (!agent) throw new Error("Agent not found");

      const sources = await db.getTrainingSources(input.agentId);
      const trainingContext = sources
        .filter(s => s.processedContent || s.content)
        .map(s => s.processedContent || s.content)
        .join("\n\n");

      const systemPrompt = `${agent.systemPrompt || "You are a helpful AI assistant."}\n\nTraining data:\n${trainingContext}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.message },
        ],
      });

      // Increment interaction count
      await db.updateClientAgent(input.agentId, ctx.user.id, {
        totalInteractions: (agent.totalInteractions || 0) + 1,
      });

      const content = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      return { content };
    }),
});

// ─── Client Websites Router ─────────────────────────────────────────────────
const websitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getClientWebsites(ctx.user.id);
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getClientWebsiteById(input.id, ctx.user.id);
    }),
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      domain: z.string().optional(),
      description: z.string().optional(),
      template: z.string().optional(),
      clientName: z.string().optional(),
      monthlyFee: z.string().optional(),
      chatbotEnabled: z.boolean().optional(),
      chatbotAgentId: z.number().optional(),
      pages: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createClientWebsite({ ...input, userId: ctx.user.id });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      domain: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "published", "paused"]).optional(),
      template: z.string().optional(),
      pages: z.string().optional(),
      chatbotEnabled: z.boolean().optional(),
      chatbotAgentId: z.number().optional(),
      clientName: z.string().optional(),
      monthlyFee: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateClientWebsite(id, ctx.user.id, data);
      return { success: true };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteClientWebsite(input.id, ctx.user.id);
      return { success: true };
    }),
  // Generate chatbot embed code
  getEmbedCode: protectedProcedure
    .input(z.object({ websiteId: z.number() }))
    .query(async ({ ctx, input }) => {
      const website = await db.getClientWebsiteById(input.websiteId, ctx.user.id);
      if (!website) throw new Error("Website not found");
      const origin = process.env.VITE_APP_URL || "https://your-domain.com";
      return {
        embedCode: `<!-- NexusCommand Chatbot Widget -->\n<script>\n  (function() {\n    var s = document.createElement('script');\n    s.src = '${origin}/api/chatbot/widget.js';\n    s.dataset.websiteId = '${website.id}';\n    s.dataset.agentId = '${website.chatbotAgentId || ""}';\n    s.async = true;\n    document.head.appendChild(s);\n  })();\n</script>`,
      };
    }),
});

// ─── Analytics Router ───────────────────────────────────────────────────────
const analyticsRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    return db.getAnalyticsSummary(ctx.user.id);
  }),
  events: protectedProcedure
    .input(z.object({
      entityType: z.enum(["agent", "website"]).optional(),
      entityId: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return db.getAnalyticsEvents(ctx.user.id, input?.entityType, input?.entityId, input?.limit);
    }),
  logEvent: protectedProcedure
    .input(z.object({
      entityType: z.enum(["agent", "website"]),
      entityId: z.number(),
      eventType: z.string(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.logAnalyticsEvent({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
});

// ─── Billing Router ─────────────────────────────────────────────────────────
const billingRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getClientBillings(ctx.user.id);
  }),
  create: protectedProcedure
    .input(z.object({
      clientName: z.string().min(1),
      entityType: z.enum(["agent", "website"]),
      entityId: z.number(),
      monthlyAmount: z.string(),
      nextBillingDate: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createClientBilling({
        ...input,
        userId: ctx.user.id,
        nextBillingDate: input.nextBillingDate ? new Date(input.nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      return { id };
    }),
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "paused", "cancelled"]).optional(),
      monthlyAmount: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateClientBilling(id, ctx.user.id, data);
      return { success: true };
    }),
});

// ─── Stripe Router ─────────────────────────────────────────────────────────
const stripeRouter = router({
  // Product management
  products: protectedProcedure.query(async ({ ctx }) => {
    return db.getStripeProducts(ctx.user.id);
  }),
  getProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return db.getStripeProductById(input.id, ctx.user.id);
    }),
  createProduct: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(["one_time", "subscription"]),
      amount: z.string(), // dollar amount
      currency: z.string().optional(),
      interval: z.enum(["month", "year", "week"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const amountCents = Math.round(parseFloat(input.amount) * 100);
      try {
        // Create in Stripe
        const { productId, priceId } = await stripeHelper.createStripeProduct({
          name: input.name,
          description: input.description,
          amount: amountCents,
          currency: input.currency || "usd",
          type: input.type,
          interval: input.interval,
        });
        // Save locally
        const id = await db.createStripeProduct({
          userId: ctx.user.id,
          stripeProductId: productId,
          stripePriceId: priceId,
          name: input.name,
          description: input.description || null,
          type: input.type,
          amount: input.amount,
          currency: input.currency || "USD",
          interval: input.interval || "month",
        });
        return { id, stripeProductId: productId, stripePriceId: priceId };
      } catch (error: any) {
        // If Stripe fails, save locally without Stripe IDs (can sync later)
        const id = await db.createStripeProduct({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          type: input.type,
          amount: input.amount,
          currency: input.currency || "USD",
          interval: input.interval || "month",
        });
        return { id, error: error.message };
      }
    }),
  updateProduct: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateStripeProduct(id, ctx.user.id, data);
      return { success: true };
    }),
  deleteProduct: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteStripeProduct(input.id, ctx.user.id);
      return { success: true };
    }),

  // Checkout
  createCheckout: protectedProcedure
    .input(z.object({
      productId: z.number(),
      origin: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await db.getStripeProductById(input.productId, ctx.user.id);
      if (!product) throw new Error("Product not found");
      if (!product.stripePriceId) throw new Error("Product not synced with Stripe. Please recreate the product.");

      // Get or create Stripe customer
      const customerId = await stripeHelper.getOrCreateStripeCustomer(
        ctx.user.email || "",
        ctx.user.name,
        { user_id: ctx.user.id.toString() }
      );
      await db.upsertStripeCustomer(ctx.user.id, customerId);

      const mode = product.type === "subscription" ? "subscription" : "payment";
      const { url, sessionId } = await stripeHelper.createCheckoutSession({
        priceId: product.stripePriceId,
        mode,
        customerEmail: ctx.user.email || "",
        userId: ctx.user.id,
        userName: ctx.user.name,
        productId: product.id,
        origin: input.origin,
      });

      // Create pending order
      await db.createStripeOrder({
        userId: ctx.user.id,
        stripeSessionId: sessionId,
        productId: product.id,
        customerEmail: ctx.user.email,
        amount: product.amount,
        currency: product.currency,
        status: "pending",
      });

      return { url, sessionId };
    }),

  // Orders
  orders: protectedProcedure.query(async ({ ctx }) => {
    return db.getStripeOrders(ctx.user.id);
  }),

  // Subscriptions
  subscriptions: protectedProcedure.query(async ({ ctx }) => {
    return db.getStripeSubscriptions(ctx.user.id);
  }),
  cancelSubscription: protectedProcedure
    .input(z.object({ stripeSubscriptionId: z.string() }))
    .mutation(async ({ input }) => {
      await stripeHelper.cancelSubscription(input.stripeSubscriptionId);
      await db.updateStripeSubscription(input.stripeSubscriptionId, { cancelAtPeriodEnd: true });
      return { success: true };
    }),
});

// ─── Main Router ────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  dashboard: dashboardRouter,
  contacts: contactsRouter,
  pipelines: pipelinesRouter,
  deals: dealsRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  invoices: invoicesRouter,
  banking: bankingRouter,
  payments: paymentsRouter,
  ai: aiRouter,
  agents: agentsRouter,
  websites: websitesRouter,
  analytics: analyticsRouter,
  billing: billingRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
