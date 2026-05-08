import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

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
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("Admin Notification Preferences", () => {
  it("getNotificationPrefs returns default preferences", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const prefs = await caller.admin.getNotificationPrefs();
    expect(prefs).toBeDefined();
    expect(prefs.emailEnabled).toBe(true);
    expect(prefs.minSeverity).toBe("warning");
    expect(prefs.cooldownMinutes).toBe(30);
  });

  it("updateNotificationPrefs updates emailEnabled", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateNotificationPrefs({ emailEnabled: false });
    expect(result).toEqual({ success: true });

    const prefs = await caller.admin.getNotificationPrefs();
    expect(prefs.emailEnabled).toBe(false);
  });

  it("updateNotificationPrefs updates minSeverity", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateNotificationPrefs({ minSeverity: "critical" });
    expect(result).toEqual({ success: true });

    const prefs = await caller.admin.getNotificationPrefs();
    expect(prefs.minSeverity).toBe("critical");
  });

  it("updateNotificationPrefs updates cooldownMinutes", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateNotificationPrefs({ cooldownMinutes: 30 });
    expect(result).toEqual({ success: true });

    const prefs = await caller.admin.getNotificationPrefs();
    expect(prefs.cooldownMinutes).toBe(30);
  });

  it("updateNotificationPrefs rejects invalid cooldown values", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.updateNotificationPrefs({ cooldownMinutes: 0 })
    ).rejects.toThrow();

    await expect(
      caller.admin.updateNotificationPrefs({ cooldownMinutes: 2000 })
    ).rejects.toThrow();
  });
});

describe("Alert Notification Integration", () => {
  it("logHealth with status 'down' creates alert and triggers notification flow", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // First ensure notifications are enabled
    await caller.admin.updateNotificationPrefs({ emailEnabled: true, minSeverity: "warning" });

    // Log a health check with down status
    const result = await caller.admin.logHealth({
      entityType: "agent",
      entityId: 1,
      status: "down",
      responseTimeMs: 0,
      errorMessage: "Connection refused",
    });

    expect(result).toEqual({ success: true });

    // Verify alert was created
    const alerts = await caller.admin.alerts();
    const criticalAlerts = alerts.filter(a => a.severity === "critical" && a.entityType === "agent");
    expect(criticalAlerts.length).toBeGreaterThan(0);
  });

  it("logHealth with status 'degraded' creates warning alert", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.logHealth({
      entityType: "website",
      entityId: 2,
      status: "degraded",
      responseTimeMs: 5000,
      errorMessage: "Slow response",
    });

    expect(result).toEqual({ success: true });

    const alerts = await caller.admin.alerts();
    const warningAlerts = alerts.filter(a => a.severity === "warning" && a.entityType === "website");
    expect(warningAlerts.length).toBeGreaterThan(0);
  });

  it("logHealth with status 'healthy' does not create alert", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Get current alert count
    const alertsBefore = await caller.admin.alerts();
    const countBefore = alertsBefore.length;

    const result = await caller.admin.logHealth({
      entityType: "agent",
      entityId: 3,
      status: "healthy",
      responseTimeMs: 150,
    });

    expect(result).toEqual({ success: true });

    // Alert count should not increase
    const alertsAfter = await caller.admin.alerts();
    expect(alertsAfter.length).toBe(countBefore);
  });
});
