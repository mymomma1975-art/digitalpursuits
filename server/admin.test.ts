import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("admin.overview", () => {
  it("returns overview stats structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.overview();

    expect(result).toHaveProperty("totalClients");
    expect(result).toHaveProperty("activeAgents");
    expect(result).toHaveProperty("totalMRR");
    expect(result).toHaveProperty("totalInteractions");
    expect(result).toHaveProperty("totalVisits");
    expect(result).toHaveProperty("unreadAlerts");
    expect(typeof result.totalClients).toBe("number");
    expect(typeof result.totalMRR).toBe("string");
  });
});

describe("admin.clients", () => {
  it("returns an array of client data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.clients();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.healthChecks", () => {
  it("returns health check data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.healthChecks();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.alerts", () => {
  it("returns alerts list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.alerts();

    expect(Array.isArray(result)).toBe(true);
  });

  it("can filter unread alerts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.alerts({ unreadOnly: true });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin.logHealth", () => {
  it("logs a health check and returns success", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.logHealth({
      entityType: "agent",
      entityId: 1,
      status: "healthy",
      responseTimeMs: 120,
    });

    expect(result).toEqual({ success: true });
  });

  it("creates alert when status is down", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.logHealth({
      entityType: "agent",
      entityId: 1,
      status: "down",
      errorMessage: "Connection timeout",
    });

    expect(result).toEqual({ success: true });

    // Verify alert was created
    const alerts = await caller.admin.alerts();
    const criticalAlert = alerts.find(a => a.severity === "critical" && a.entityId === 1);
    expect(criticalAlert).toBeDefined();
  });
});

describe("admin.markAllAlertsRead", () => {
  it("marks all alerts as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.markAllAlertsRead();

    expect(result).toEqual({ success: true });
  });
});
