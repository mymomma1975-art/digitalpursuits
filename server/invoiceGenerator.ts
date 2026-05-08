import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { subscriptionInvoices, pricingTiers, stripeSubscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * AI-powered invoice generation service
 * Generates accurate invoices using LLM with verification
 */

export interface InvoiceGenerationRequest {
  subscriptionId: number;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  clientName: string;
  clientEmail: string;
  customLineItems?: Array<{ description: string; amount: number }>;
}

export interface GeneratedInvoice {
  invoiceNumber: string;
  amount: number;
  lineItems: Array<{ description: string; amount: number; quantity?: number }>;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: Date;
  description: string;
}

/**
 * Generate an invoice using AI with verification
 */
export async function generateInvoiceWithAI(
  request: InvoiceGenerationRequest,
  userId: number
): Promise<GeneratedInvoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get subscription and pricing tier info
  const subscription = await db
    .select()
    .from(stripeSubscriptions)
    .where(eq(stripeSubscriptions.id, request.subscriptionId))
    .limit(1);

  if (!subscription.length) {
    throw new Error(`Subscription ${request.subscriptionId} not found`);
  }

  const pricingTier = subscription[0].productId
    ? await db
        .select()
        .from(pricingTiers)
        .where(eq(pricingTiers.id, subscription[0].productId))
        .limit(1)
    : null;

  // Build invoice context for LLM
  const invoiceContext = {
    clientName: request.clientName,
    clientEmail: request.clientEmail,
    billingPeriodStart: request.billingPeriodStart.toISOString().split("T")[0],
    billingPeriodEnd: request.billingPeriodEnd.toISOString().split("T")[0],
    planName: pricingTier?.[0]?.name || "Custom",
    monthlyPrice: pricingTier?.[0]?.monthlyPrice || "0.00",
    customLineItems: request.customLineItems || [],
    daysInPeriod: Math.ceil(
      (request.billingPeriodEnd.getTime() - request.billingPeriodStart.getTime()) /
        (1000 * 60 * 60 * 24)
    ),
  };

  // Use LLM to generate invoice with verification
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert invoice generator. Generate accurate invoices with proper calculations.
        
Current date: ${new Date().toISOString().split("T")[0]}
Invoice context: ${JSON.stringify(invoiceContext)}

Generate a professional invoice with:
1. Accurate line items and calculations
2. Proper tax calculation (if applicable)
3. Clear due date (30 days from billing period end)
4. Professional description
5. Verification of all math

Return ONLY valid JSON matching this schema:
{
  "invoiceNumber": "INV-YYYYMMDD-XXXXX",
  "lineItems": [
    {"description": "string", "amount": number, "quantity": number}
  ],
  "subtotal": number,
  "tax": number,
  "total": number,
  "dueDate": "YYYY-MM-DD",
  "description": "string"
}`,
      },
      {
        role: "user",
        content: `Generate invoice for ${request.clientName} for billing period ${invoiceContext.billingPeriodStart} to ${invoiceContext.billingPeriodEnd}. Plan: ${invoiceContext.planName} at $${invoiceContext.monthlyPrice}/month.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "invoice_generation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            invoiceNumber: { type: "string" },
            lineItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  amount: { type: "number" },
                  quantity: { type: "number" },
                },
                required: ["description", "amount"],
              },
            },
            subtotal: { type: "number" },
            tax: { type: "number" },
            total: { type: "number" },
            dueDate: { type: "string" },
            description: { type: "string" },
          },
          required: ["invoiceNumber", "lineItems", "subtotal", "tax", "total", "dueDate", "description"],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse and verify the response
  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("No invoice generated");

  const invoiceData = JSON.parse(content) as GeneratedInvoice;

  // Verify calculations
  const calculatedSubtotal = invoiceData.lineItems.reduce(
    (sum, item) => sum + item.amount * (item.quantity || 1),
    0
  );
  const calculatedTotal = calculatedSubtotal + invoiceData.tax;

  if (Math.abs(calculatedSubtotal - invoiceData.subtotal) > 0.01) {
    throw new Error(
      `Subtotal mismatch: calculated ${calculatedSubtotal}, got ${invoiceData.subtotal}`
    );
  }

  if (Math.abs(calculatedTotal - invoiceData.total) > 0.01) {
    throw new Error(`Total mismatch: calculated ${calculatedTotal}, got ${invoiceData.total}`);
  }

  return invoiceData;
}

/**
 * Save generated invoice to database
 */
export async function saveGeneratedInvoice(
  userId: number,
  subscriptionId: number,
  pricingTierId: number,
  invoice: GeneratedInvoice,
  request: InvoiceGenerationRequest
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptionInvoices).values({
    userId: userId as any,
    subscriptionId: subscriptionId as any,
    pricingTierId: pricingTierId as any,
    invoiceNumber: invoice.invoiceNumber as any,
    amount: invoice.total.toString() as any,
    currency: "USD" as any,
    status: "draft" as any,
    billingPeriodStart: request.billingPeriodStart as any,
    billingPeriodEnd: request.billingPeriodEnd as any,
    dueDate: new Date(invoice.dueDate) as any,
    description: invoice.description as any,
    lineItems: JSON.stringify(invoice.lineItems) as any,
    generatedByAI: true as any,
  });

  return result[0].insertId || 0;
}

/**
 * Get invoice generation suggestions from Copilot
 */
export async function getInvoiceGenerationSuggestions(
  subscriptionId: number
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a billing expert. Provide brief, actionable suggestions for invoice generation.",
      },
      {
        role: "user",
        content: `Subscription ID: ${subscriptionId}. What should I include in this invoice? Any special considerations?`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : "No suggestions available";
}
