import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import {
  copilotConversations,
  copilotMessages,
  copilotKnowledgeBase,
  copilotSuggestions,
  CopilotConversation,
  CopilotMessage,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * AI Copilot Service
 * Provides intelligent assistance for platform tasks with internet access and platform knowledge
 */

export interface CopilotChatRequest {
  conversationId?: number;
  userId: number;
  message: string;
  topic?: "agent_building" | "website_creation" | "analytics" | "troubleshooting" | "general";
  context?: {
    currentPage?: string;
    agentId?: number;
    websiteId?: number;
    clientData?: Record<string, unknown>;
  };
}

export interface CopilotChatResponse {
  conversationId: number;
  messageId: number;
  response: string;
  sourceUrls?: string[];
  suggestions?: Array<{
    title: string;
    description: string;
    action: string;
  }>;
}

/**
 * Initialize platform knowledge base with documentation
 * This is called once to populate the knowledge base
 */
export async function initializeCopilotKnowledgeBase(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const platformDocs = [
    {
      title: "Building an AI Agent",
      category: "agent_building" as const,
      content: `
# Building an AI Agent in NexusCommand

## Overview
AI Agents are custom chatbots trained on your business data that can answer customer questions 24/7.

## Steps to Build an Agent:
1. Create a new agent with a name and description
2. Write a system prompt that defines the agent's personality and behavior
3. Upload training data (FAQs, documents, URLs, or paste content directly)
4. Configure response behavior and escalation rules
5. Test the agent with sample questions
6. Deploy to your website with one click

## Training Data Sources:
- PDF documents
- Word documents
- Text files
- Website URLs (web scraping)
- FAQ content (paste directly)
- Email conversations

## System Prompt Best Practices:
- Define the agent's role and expertise
- Specify tone and communication style
- Set boundaries for what the agent should/shouldn't do
- Include escalation rules for complex questions
- Add personality traits that match your brand

## Analytics:
- Monitor conversations per day
- Track response times
- Measure customer satisfaction
- Identify common questions
- Optimize based on performance
      `,
      sourceUrl: "https://docs.nexuscommand.com/agents",
    },
    {
      title: "Building a Website",
      category: "website_creation" as const,
      content: `
# Building a Website in NexusCommand

## Overview
Create professional, mobile-responsive websites with built-in AI chatbot integration.

## Website Builder Features:
- Drag-and-drop page builder
- Pre-built page templates (Home, About, Services, Contact, etc.)
- Custom domain support
- Mobile-responsive design
- Built-in SEO optimization
- Embedded AI chatbot widget
- Contact form integration
- Analytics tracking

## Creating Pages:
1. Add a new page (choose template or blank)
2. Customize layout, colors, and fonts
3. Add content (text, images, forms)
4. Configure domain and DNS
5. Publish and go live

## Embedding Your AI Agent:
- Chatbot widget automatically appears on your website
- Customizable position (bottom-right, bottom-left, etc.)
- Customizable appearance (colors, branding)
- Handles unlimited conversations
- Integrates with your agent training data

## Domain Configuration:
- Point your domain to our servers (easiest)
- Deploy to your own server (advanced)
- Use a subdomain (e.g., app.yourdomain.com)

## SEO Best Practices:
- Use descriptive page titles
- Add meta descriptions
- Use header tags (H1, H2, H3) properly
- Include alt text for images
- Create a sitemap
- Enable analytics tracking
      `,
      sourceUrl: "https://docs.nexuscommand.com/websites",
    },
    {
      title: "Analytics Dashboard",
      category: "analytics" as const,
      content: `
# Analytics Dashboard

## Overview
Monitor your AI agent and website performance in real-time.

## Agent Analytics:
- Total conversations
- Average response time
- Customer satisfaction rating
- Resolution rate (% of questions answered without escalation)
- Common questions asked
- Conversation trends over time
- Peak usage times

## Website Analytics:
- Total visitors
- Page views
- Bounce rate
- Traffic sources (direct, search, referral)
- Top pages
- User flow
- Conversion tracking

## Key Metrics to Monitor:
- Agent Response Time: Aim for < 3 seconds
- Resolution Rate: Target 80%+ of questions resolved by AI
- Website Bounce Rate: Lower is better (target < 50%)
- Conversion Rate: Track form submissions and sign-ups

## Optimization Tips:
- If resolution rate is low, add more training data
- If response time is slow, check agent configuration
- If bounce rate is high, improve website content/design
- Use traffic sources to understand where customers come from

## Reports:
- Daily summary reports
- Weekly performance trends
- Monthly growth analysis
- Custom date ranges
      `,
      sourceUrl: "https://docs.nexuscommand.com/analytics",
    },
    {
      title: "Deployment Options",
      category: "deployment" as const,
      content: `
# Deployment Options

## Option 1: We Host Everything (Recommended)
- We manage servers, security, backups, and updates
- Your domain points to our infrastructure
- Zero technical knowledge required
- $120/month per client instance
- Included: SSL, backups, monitoring, support

## Option 2: Your Own Server
- Deploy to AWS, DigitalOcean, Vultr, or any VPS
- You own the infrastructure
- We provide setup and optional maintenance
- One-time setup fee
- More control, more responsibility

## Option 3: Hybrid
- Keep your existing website
- We build the AI agent and analytics
- Embed our chatbot widget with one line of code
- Custom pricing

## Deployment Steps (Option 1):
1. Fill out client intake form
2. We build and configure everything
3. Point your domain to our servers
4. Go live with 30-day free trial

## Deployment Steps (Option 2):
1. Launch a VPS (AWS, DigitalOcean, etc.)
2. Run deployment script: ./deploy/deploy-aws.sh
3. Configure environment variables
4. Point domain to your server
5. Go live

## Monitoring:
- Real-time health checks
- Instant alerts for issues
- Automatic failover
- Daily backups
- 99.9% uptime guarantee
      `,
      sourceUrl: "https://docs.nexuscommand.com/deployment",
    },
    {
      title: "Troubleshooting Guide",
      category: "troubleshooting" as const,
      content: `
# Troubleshooting Guide

## Agent Not Responding
- Check agent status (draft vs. active)
- Verify training data is uploaded
- Test with simple questions first
- Check response time in analytics
- Add more training data if resolution rate is low

## Website Not Loading
- Verify domain DNS settings
- Check SSL certificate status
- Verify server is running
- Check browser console for errors
- Clear cache and try again

## Analytics Not Showing Data
- Verify tracking is enabled
- Check that agent/website is active
- Wait 5-10 minutes for data to populate
- Verify JavaScript is enabled in browser
- Check for browser ad blockers

## Slow Response Times
- Check server load in Admin Monitor
- Verify agent training data isn't too large
- Check internet connection speed
- Optimize system prompt (make it shorter)
- Consider upgrading server resources

## Payment Issues
- Verify Stripe keys are configured
- Check subscription status
- Verify billing address matches
- Check for failed payment notifications
- Contact support if issue persists

## Common Error Messages:
- "Agent not found": Verify agent ID is correct
- "Training data too large": Reduce file sizes
- "Domain not configured": Update DNS settings
- "SSL certificate error": Wait 24 hours for renewal
      `,
      sourceUrl: "https://docs.nexuscommand.com/troubleshooting",
    },
  ];

  try {
    // Check if knowledge base already exists
    const existing = await db.select().from(copilotKnowledgeBase).limit(1);
    if (existing.length > 0) {
      console.log("[Copilot] Knowledge base already initialized");
      return;
    }

    // Insert platform documentation
    for (const doc of platformDocs) {
      await db.insert(copilotKnowledgeBase).values({
        title: doc.title,
        category: doc.category,
        content: doc.content,
        sourceUrl: doc.sourceUrl,
      });
    }

    console.log("[Copilot] Knowledge base initialized with platform documentation");
  } catch (error) {
    console.error("[Copilot] Failed to initialize knowledge base:", error);
  }
}

/**
 * Get or create a copilot conversation
 */
export async function getOrCreateConversation(
  userId: number,
  conversationId?: number,
  topic: string = "general"
): Promise<CopilotConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (conversationId) {
    const existing = await db
      .select()
      .from(copilotConversations)
      .where(and(eq(copilotConversations.id, conversationId), eq(copilotConversations.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }
  }

  // Create new conversation
  const result = await db
    .insert(copilotConversations)
    .values({
      userId,
      title: `Conversation - ${new Date().toLocaleDateString()}`,
      topic: (topic as any) || "general",
    })
    .$returningId();

  return {
    id: result[0].id,
    userId,
    title: `Conversation - ${new Date().toLocaleDateString()}`,
    topic: (topic as any) || "general",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get conversation history for context
 */
export async function getConversationHistory(conversationId: number, limit: number = 10): Promise<CopilotMessage[]> {
  const db = await getDb();
  if (!db) return [];

  const messages = await db
    .select()
    .from(copilotMessages)
    .where(eq(copilotMessages.conversationId, conversationId))
    .orderBy(copilotMessages.createdAt)
    .limit(limit);

  return messages;
}

/**
 * Get relevant knowledge base entries for a query
 */
export async function getRelevantKnowledge(query: string, limit: number = 3): Promise<string> {
  const db = await getDb();
  if (!db) return "";

  // Simple keyword matching (in production, use semantic search with embeddings)
  const keywords = query.toLowerCase().split(" ");
  const knowledge = await db.select().from(copilotKnowledgeBase).limit(10);

  const relevant = knowledge
    .filter((entry) => {
      const text = (entry.title + " " + entry.content).toLowerCase();
      return keywords.some((keyword) => text.includes(keyword));
    })
    .slice(0, limit);

  return relevant.map((entry) => `## ${entry.title}\n${entry.content}`).join("\n\n");
}

/**
 * Chat with the AI Copilot
 */
export async function chatWithCopilot(request: CopilotChatRequest): Promise<CopilotChatResponse> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get or create conversation
  const conversation = await getOrCreateConversation(request.userId, request.conversationId, request.topic);

  // Get conversation history
  const history = await getConversationHistory(conversation.id, 5);

  // Get relevant knowledge base entries
  const relevantKnowledge = await getRelevantKnowledge(request.message);

  // Build system prompt with platform knowledge
  const systemPrompt = `You are NexusCommand's AI Copilot, an expert assistant helping users build AI agents, create websites, optimize analytics, and troubleshoot issues on the NexusCommand platform.

You have access to the following platform documentation:

${relevantKnowledge}

Your role is to:
1. Provide expert guidance on building AI agents and websites
2. Help optimize analytics and performance
3. Troubleshoot common issues
4. Suggest improvements based on best practices
5. Access the internet to find additional information when needed
6. Explain platform features clearly and concisely

When answering questions:
- Be specific and actionable
- Provide step-by-step guidance when needed
- Reference platform documentation when relevant
- Suggest optimizations and best practices
- If you need additional information from the internet, mention it
- Always prioritize the user's business goals`;

  // Build message history for LLM
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Add conversation history
  for (const msg of history) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  // Add current message
  messages.push({
    role: "user",
    content: request.message,
  });

  // Call LLM with internet access capability
  const response = await invokeLLM({
    messages,
  });

  const assistantContent = response.choices[0]?.message?.content;
  const assistantMessage = typeof assistantContent === "string" ? assistantContent : "I couldn't generate a response. Please try again.";

  // Save messages to database
  const userMsgResult = await db
    .insert(copilotMessages)
    .values({
      conversationId: conversation.id,
      role: "user",
      content: request.message,
      context: request.context ? JSON.stringify(request.context) : undefined,
    })
    .$returningId();

  const assistantMsgResult = await db
    .insert(copilotMessages)
    .values({
      conversationId: conversation.id,
      role: "assistant",
      content: assistantMessage,
    })
    .$returningId();

  // Generate suggestions based on context
  const suggestions = await generateSuggestions(request.userId, request.context, assistantMessage);

  return {
    conversationId: conversation.id,
    messageId: assistantMsgResult[0].id,
    response: assistantMessage,
    suggestions,
  };
}

/**
 * Generate AI suggestions for improvement
 */
async function generateSuggestions(
  userId: number,
  context: CopilotChatRequest["context"] | undefined,
  response: string
): Promise<Array<{ title: string; description: string; action: string }>> {
  const db = await getDb();
  if (!db) return [];

  // Parse response to extract actionable suggestions
  const suggestions: Array<{ title: string; description: string; action: string }> = [];

  // Example: if response mentions "add more training data", create a suggestion
  if (response.toLowerCase().includes("training data")) {
    suggestions.push({
      title: "Enhance Agent Training",
      description: "Add more diverse training data to improve agent responses",
      action: "upload_training_data",
    });
  }

  if (response.toLowerCase().includes("optimize") || response.toLowerCase().includes("improve")) {
    suggestions.push({
      title: "Performance Optimization",
      description: "Review and optimize your current setup",
      action: "review_analytics",
    });
  }

  // Save suggestions to database
  for (const suggestion of suggestions) {
    try {
      await db.insert(copilotSuggestions).values({
        userId,
        entityType: context?.agentId ? "agent" : context?.websiteId ? "website" : "analytics",
        entityId: context?.agentId || context?.websiteId,
        title: suggestion.title,
        description: suggestion.description,
        suggestedAction: suggestion.action,
        priority: "medium",
      });
    } catch (error) {
      console.error("[Copilot] Failed to save suggestion:", error);
    }
  }

  return suggestions;
}

/**
 * Get copilot suggestions for a user
 */
export async function getCopilotSuggestions(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const suggestions = await db
    .select()
    .from(copilotSuggestions)
    .where(and(eq(copilotSuggestions.userId, userId), eq(copilotSuggestions.isImplemented, false)))
    .orderBy(copilotSuggestions.priority)
    .limit(limit);

  return suggestions;
}

/**
 * Mark a suggestion as implemented
 */
export async function markSuggestionImplemented(suggestionId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(copilotSuggestions)
    .set({ isImplemented: true, implementedAt: new Date() })
    .where(eq(copilotSuggestions.id, suggestionId));
}
