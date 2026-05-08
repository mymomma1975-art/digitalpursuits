import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return { ctx };
}

describe("copilot router", () => {
  it(
    "chat mutation accepts message and returns response",
    async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.copilot.chat({
        message: "How do I build an AI agent?",
        topic: "agent_building",
      });

      expect(result).toBeDefined();
      expect(result.conversationId).toBeGreaterThan(0);
      expect(result.messageId).toBeGreaterThan(0);
      expect(result.response).toBeTruthy();
      expect(typeof result.response).toBe("string");
    },
    { timeout: 15000 }
  );

  it("chat mutation validates message length", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.copilot.chat({
        message: "", // Empty message should fail
        topic: "general",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it(
    "chat mutation accepts different topics",
    async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const topics = ["agent_building", "website_creation", "analytics", "troubleshooting", "general"] as const;

      for (const topic of topics) {
        const result = await caller.copilot.chat({
          message: `Tell me about ${topic}`,
          topic,
        });

        expect(result).toBeDefined();
        expect(result.response).toBeTruthy();
      }
    },
    { timeout: 60000 }
  );

  it("suggestions query returns array of suggestions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const suggestions = await caller.copilot.suggestions();

    expect(Array.isArray(suggestions)).toBe(true);
    // Suggestions might be empty initially, but should be an array
    if (suggestions.length > 0) {
      expect(suggestions[0]).toHaveProperty("id");
      expect(suggestions[0]).toHaveProperty("title");
      expect(suggestions[0]).toHaveProperty("description");
      expect(suggestions[0]).toHaveProperty("priority");
    }
  });

  it("markSuggestionDone mutation marks suggestion as implemented", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get suggestions
    const suggestions = await caller.copilot.suggestions();

    if (suggestions.length > 0) {
      const result = await caller.copilot.markSuggestionDone({
        suggestionId: suggestions[0].id,
      });

      expect(result).toEqual({ success: true });
    }
  });

  it(
    "chat mutation with context includes page information",
    async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.copilot.chat({
        message: "Help me with this",
        topic: "general",
        context: {
          currentPage: "agent_builder",
          agentId: 123,
        },
      });

      expect(result).toBeDefined();
      expect(result.response).toBeTruthy();
    },
    { timeout: 15000 }
  );

  it(
    "chat mutation persists conversation",
    async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First message
      const result1 = await caller.copilot.chat({
        message: "What is an AI agent?",
        topic: "agent_building",
      });

      expect(result1.conversationId).toBeGreaterThan(0);

      // Second message in same conversation
      const result2 = await caller.copilot.chat({
        conversationId: result1.conversationId,
        message: "How do I train it?",
        topic: "agent_building",
      });

      expect(result2.conversationId).toBe(result1.conversationId);
      expect(result2.messageId).not.toBe(result1.messageId);
    },
    { timeout: 60000 }
  );
});
