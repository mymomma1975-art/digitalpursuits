import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ─── Stripe webhook (MUST be before json body parser) ─────────────────
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    try {
      const { constructWebhookEvent } = await import("../stripe");
      const event = constructWebhookEvent(req.body as Buffer, sig);

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      const { getDb } = await import("../db");
      const db = await getDb();

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;
          const { updateStripeOrderBySession, upsertStripeSubscription, upsertStripeCustomer } = await import("../db");
          // Update order status
          await updateStripeOrderBySession(session.id, {
            stripePaymentIntentId: session.payment_intent || null,
            status: "completed",
          });
          // If subscription, save it
          if (session.subscription && session.metadata?.user_id) {
            await upsertStripeSubscription({
              userId: parseInt(session.metadata.user_id),
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
              productId: session.metadata.product_id ? parseInt(session.metadata.product_id) : null,
              status: "active",
            });
          }
          // Save customer mapping
          if (session.customer && session.metadata?.user_id) {
            await upsertStripeCustomer(parseInt(session.metadata.user_id), session.customer);
          }
          break;
        }
        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const { updateStripeSubscription } = await import("../db");
          await updateStripeSubscription(sub.id, {
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          });
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const { updateStripeSubscription } = await import("../db");
          await updateStripeSubscription(sub.id, { status: "cancelled" });
          break;
        }
        case "payment_intent.succeeded": {
          console.log(`[Webhook] Payment succeeded: ${(event.data.object as any).id}`);
          break;
        }
        case "invoice.paid": {
          console.log(`[Webhook] Invoice paid: ${(event.data.object as any).id}`);
          break;
        }
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error(`[Webhook] Error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
