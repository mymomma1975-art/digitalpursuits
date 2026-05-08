/**
 * Alert Notification Service
 * 
 * Sends real-time notifications to the platform owner when critical
 * or warning alerts are triggered. Uses the built-in Manus notification
 * system (push notifications) and logs all sent notifications.
 * 
 * Features:
 * - Respects notification preferences (enabled/disabled, severity threshold)
 * - Cooldown period to prevent notification spam for the same entity
 * - Logs all sent notifications for audit trail
 * - Graceful fallback if notification service is unavailable
 */

import { eq, and, gte } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { notificationPreferences, notificationLog } from "../drizzle/schema";

export interface AlertNotificationPayload {
  userId: number;
  alertId?: number;
  entityType: "agent" | "website" | "billing" | "system";
  entityId?: number;
  severity: "info" | "warning" | "critical";
  title: string;
  message?: string;
}

const SEVERITY_LEVELS: Record<string, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

/**
 * Get or create notification preferences for a user.
 * Defaults: emailEnabled=true, minSeverity="warning", cooldownMinutes=15
 */
export async function getNotificationPrefs(userId: number) {
  const db = await getDb();
  if (!db) return { emailEnabled: true, minSeverity: "warning" as const, cooldownMinutes: 15 };

  const results = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (results.length === 0) {
    // Create default preferences
    await db.insert(notificationPreferences).values({ userId });
    return { emailEnabled: true, minSeverity: "warning" as const, cooldownMinutes: 15 };
  }

  return results[0];
}

/**
 * Update notification preferences for a user.
 */
export async function updateNotificationPrefs(userId: number, prefs: {
  emailEnabled?: boolean;
  minSeverity?: "info" | "warning" | "critical";
  cooldownMinutes?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const existing = await db.select().from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(notificationPreferences).values({ userId, ...prefs });
  } else {
    await db.update(notificationPreferences)
      .set(prefs)
      .where(eq(notificationPreferences.userId, userId));
  }
}

/**
 * Check if we're within the cooldown period for this entity.
 * Returns true if we should suppress the notification.
 */
async function isInCooldown(userId: number, entityType: string, entityId: number | undefined, cooldownMinutes: number): Promise<boolean> {
  if (!entityId) return false;
  
  const db = await getDb();
  if (!db) return false;

  const cutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  
  const recentNotifications = await db.select().from(notificationLog)
    .where(and(
      eq(notificationLog.userId, userId),
      gte(notificationLog.sentAt, cutoff),
    ))
    .limit(10);

  // Check if any recent notification was for the same entity
  return recentNotifications.some(n => {
    const msg = n.message || "";
    return msg.includes(`[${entityType}:${entityId}]`);
  });
}

/**
 * Log a sent notification for audit trail.
 */
async function logNotification(data: {
  userId: number;
  alertId?: number;
  channel: "push" | "email";
  title: string;
  message?: string;
  delivered: boolean;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(notificationLog).values(data);
}

/**
 * Send a real-time notification for a critical alert.
 * 
 * This is the main entry point - call this whenever an alert is created.
 * It will check preferences, cooldown, and send the notification.
 * 
 * Returns true if notification was sent, false if suppressed or failed.
 */
export async function sendAlertNotification(payload: AlertNotificationPayload): Promise<boolean> {
  try {
    // Get user preferences
    const prefs = await getNotificationPrefs(payload.userId);

    // Check if notifications are enabled
    if (!prefs.emailEnabled) {
      return false;
    }

    // Check severity threshold
    const alertLevel = SEVERITY_LEVELS[payload.severity] ?? 0;
    const minLevel = SEVERITY_LEVELS[prefs.minSeverity] ?? 1;
    if (alertLevel < minLevel) {
      return false;
    }

    // Check cooldown
    const inCooldown = await isInCooldown(
      payload.userId,
      payload.entityType,
      payload.entityId,
      prefs.cooldownMinutes
    );
    if (inCooldown) {
      console.log(`[AlertNotifier] Suppressed notification for ${payload.entityType}:${payload.entityId} (cooldown)`);
      return false;
    }

    // Build notification content
    const severityEmoji = payload.severity === "critical" ? "🚨" : payload.severity === "warning" ? "⚠️" : "ℹ️";
    const title = `${severityEmoji} ${payload.title}`;
    
    const contentParts = [
      `**Severity:** ${payload.severity.toUpperCase()}`,
      `**Type:** ${payload.entityType}${payload.entityId ? ` #${payload.entityId}` : ""}`,
    ];
    if (payload.message) {
      contentParts.push(`**Details:** ${payload.message}`);
    }
    contentParts.push(`**Time:** ${new Date().toLocaleString()}`);
    contentParts.push(`\nCheck your Admin Monitor dashboard for more details.`);
    
    const content = contentParts.join("\n");

    // Send via built-in notification system
    const delivered = await notifyOwner({ title, content });

    // Log the notification
    await logNotification({
      userId: payload.userId,
      alertId: payload.alertId,
      channel: "push",
      title,
      message: `[${payload.entityType}:${payload.entityId}] ${payload.message || ""}`,
      delivered,
    });

    // Update last notified timestamp
    const db = await getDb();
    if (db) {
      await db.update(notificationPreferences)
        .set({ lastNotifiedAt: new Date() })
        .where(eq(notificationPreferences.userId, payload.userId));
    }

    if (delivered) {
      console.log(`[AlertNotifier] Notification sent: ${title}`);
    } else {
      console.warn(`[AlertNotifier] Notification delivery failed: ${title}`);
    }

    return delivered;
  } catch (error) {
    console.error("[AlertNotifier] Error sending notification:", error);
    return false;
  }
}
