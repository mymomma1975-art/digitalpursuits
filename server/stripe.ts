import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Go to Settings → Payment to set it up.");
    }
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
  }
  return _stripe;
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string | null,
  metadata: Record<string, string> = {}
): Promise<string> {
  const stripe = getStripe();

  // Search for existing customer by email
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata,
  });

  return customer.id;
}

/**
 * Create a Stripe product + price
 */
export async function createStripeProduct(opts: {
  name: string;
  description?: string;
  amount: number; // in cents
  currency?: string;
  type: "one_time" | "subscription";
  interval?: "month" | "year" | "week";
}): Promise<{ productId: string; priceId: string }> {
  const stripe = getStripe();

  const product = await stripe.products.create({
    name: opts.name,
    description: opts.description || undefined,
  });

  const priceData: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: opts.amount,
    currency: opts.currency || "usd",
  };

  if (opts.type === "subscription") {
    priceData.recurring = { interval: opts.interval || "month" };
  }

  const price = await stripe.prices.create(priceData);

  return { productId: product.id, priceId: price.id };
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(opts: {
  priceId: string;
  mode: "payment" | "subscription";
  customerEmail: string;
  userId: number;
  userName: string | null;
  productId: number;
  origin: string;
  successPath?: string;
  cancelPath?: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: opts.mode,
    payment_method_types: ["card"],
    line_items: [{ price: opts.priceId, quantity: 1 }],
    customer_email: opts.customerEmail,
    client_reference_id: opts.userId.toString(),
    allow_promotion_codes: true,
    metadata: {
      user_id: opts.userId.toString(),
      customer_email: opts.customerEmail,
      customer_name: opts.userName || "",
      product_id: opts.productId.toString(),
    },
    success_url: `${opts.origin}${opts.successPath || "/orders?success=true"}`,
    cancel_url: `${opts.origin}${opts.cancelPath || "/products?cancelled=true"}`,
  });

  return { url: session.url!, sessionId: session.id };
}

/**
 * Verify and construct webhook event
 */
export function constructWebhookEvent(
  body: Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Retrieve a checkout session with line items
 */
export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "subscription"],
  });
}

/**
 * List customer's subscriptions
 */
export async function listCustomerSubscriptions(customerId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.list({ customer: customerId, limit: 100 });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * List customer's payment intents (order history)
 */
export async function listCustomerPayments(customerId: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.list({ customer: customerId, limit: 100 });
}
