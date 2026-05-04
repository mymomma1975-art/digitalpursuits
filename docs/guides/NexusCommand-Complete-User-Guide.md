# NexusCommand: Complete User Guide

**Version:** 1.0  
**Author:** Lacey McNeil — Digital Pursuits  
**Last Updated:** May 2026

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Getting Started](#getting-started)
3. [CRM Module](#crm-module)
4. [Accounting Module](#accounting-module)
5. [Banking & Payments](#banking--payments)
6. [AI Assistant](#ai-assistant)
7. [Building Client Agents](#building-client-agents)
8. [Building Client Websites](#building-client-websites)
9. [Implementing Analytics](#implementing-analytics)
10. [Admin Monitor & Notifications](#admin-monitor--notifications)
11. [Stripe Integration](#stripe-integration)
12. [One-Click Deployment](#one-click-deployment)
13. [Hosting on Your Platform](#hosting-on-your-platform)
14. [Connecting Client Domains](#connecting-client-domains)
15. [Client Management Workflow](#client-management-workflow)

---

## Platform Overview

NexusCommand is a comprehensive business management SaaS platform that combines customer relationship management, accounting, AI-powered assistants, and client service delivery into a single unified system. The platform is designed to let you build, deploy, and manage AI agents and websites for your clients while tracking performance through built-in analytics.

| Module | Purpose |
|--------|---------|
| CRM | Manage contacts, pipelines, and deals |
| Accounting | Chart of accounts, transactions, invoices, P&L reports |
| Banking & Payments | ACH, wire, RTP, credit card processing via Plaid & Modern Treasury |
| AI Assistant | Personal AI with memory, email extraction, code generation |
| Client Agents | Build and deploy AI chatbots trained on client data |
| Client Websites | Build websites with embedded chatbot functionality |
| Analytics | Track agent interactions, website visits, and performance |
| Admin Monitor | Central dashboard to monitor all clients' services |
| Stripe | Products, subscriptions, checkout, and payment processing |

---

## Getting Started

### First Login

After deploying NexusCommand, navigate to your domain in a web browser. You will be prompted to log in through the authentication system. The first user to log in with the owner credentials is automatically assigned the **admin** role, giving you full access to all features including the Admin Monitor.

### Dashboard Navigation

The left sidebar organizes all modules into logical groups. The main sections are:

| Sidebar Section | Contains |
|----------------|----------|
| Overview | Dashboard with KPIs and quick actions |
| CRM | Contacts, Pipelines, Deals |
| Accounting | Chart of Accounts, Transactions, Invoices |
| Banking & Payments | Bank Accounts, Payments |
| AI & Agents | AI Assistant, Client Agents, Training Sources |
| Websites | Client Websites, Website Builder |
| Commerce | Stripe Products, Orders, Subscriptions |
| Analytics | Per-client analytics dashboards |
| Admin | Admin Monitor (admin role only) |

---

## CRM Module

### Contacts

The Contacts section stores all your client and lead information. Each contact record includes:

**Creating a Contact:** Navigate to CRM > Contacts and click "Add Contact." Fill in the first name (required), last name, email, phone, company, title, and any notes. Assign a status of Active, Inactive, Lead, or Customer. You can also add tags as comma-separated values for easy filtering later.

**Managing Contacts:** The contacts list shows all entries with search and filter capabilities. Click any contact to view their full profile, associated deals, invoices, and communication history.

### Pipelines

Pipelines represent your sales processes. You can create multiple pipelines for different service types (e.g., "Agent Builds," "Website Projects," "Monthly Retainers").

**Creating a Pipeline:** Navigate to CRM > Pipelines and click "New Pipeline." Give it a name and description. Then add stages — each stage represents a step in your sales process. Common stages include: Lead, Qualified, Proposal Sent, Negotiation, Won, Lost.

**Working with Stages:** Each stage has a name, order number (determines position), and color. Drag deals between stages as they progress through your pipeline.

### Deals

Deals represent potential revenue tied to a contact and pipeline stage.

**Creating a Deal:** Click "New Deal" and assign it to a contact, pipeline, and stage. Set the deal value, currency, expected close date, and any notes. The deal status can be Open, Won, or Lost.

**Pipeline View:** The pipeline view shows all deals as cards organized by stage, giving you a visual overview of your revenue pipeline.

---

## Accounting Module

### Chart of Accounts

The Chart of Accounts is the foundation of your financial tracking. Each account belongs to one of five types:

| Account Type | Purpose | Examples |
|-------------|---------|----------|
| Asset | Things you own | Cash, Equipment, Accounts Receivable |
| Liability | Things you owe | Loans, Credit Cards, Accounts Payable |
| Equity | Owner's stake | Owner's Investment, Retained Earnings |
| Revenue | Money earned | Service Income, Subscription Revenue |
| Expense | Money spent | Hosting Costs, Software, Marketing |

**Creating Accounts:** Navigate to Accounting > Chart of Accounts and click "Add Account." Select the type, give it a name and optional subtype, set the opening balance, and add a description.

### Transactions

Every financial event is recorded as a transaction linked to an account.

**Recording Transactions:** Click "New Transaction" and select the type (Income, Expense, Transfer, or Refund). Enter the amount, select the account, add a description and category, and set the transaction date. The status can be Pending, Completed, Failed, or Cancelled.

### Invoices

Invoices are professional billing documents you send to clients.

**Creating an Invoice:** Navigate to Accounting > Invoices and click "Create Invoice." Select the client (contact), add line items with descriptions and amounts, set tax if applicable, choose a due date, and add any notes. Invoice statuses flow from Draft → Sent → Paid (or Overdue/Cancelled).

**Invoice Numbering:** Each invoice gets a unique number automatically. You can customize the format in settings.

---

## Banking & Payments

### Bank Accounts (Plaid Integration)

Connect your real bank accounts through Plaid for automatic balance syncing and transaction importing.

**Connecting a Bank:** Navigate to Banking > Bank Accounts and click "Connect Bank." This launches the Plaid Link flow where you select your bank, enter credentials, and authorize the connection. Once connected, NexusCommand syncs your account balances and recent transactions automatically.

**Supported Features:** View current and available balances, see transaction history, and reconcile with your Chart of Accounts.

### Payments Processing

Process payments from clients using multiple methods:

| Payment Method | Speed | Best For |
|---------------|-------|----------|
| ACH | 2-3 business days | Recurring subscriptions, large amounts |
| Wire Transfer | Same day | Large one-time payments |
| RTP (Real-Time) | Instant | Urgent payments |
| Credit Card | Instant | Small to medium amounts |

**Processing a Payment:** Navigate to Payments and click "New Payment." Select the client, invoice (optional), payment method, and amount. Enter any tracking numbers or references. The system tracks the payment through its lifecycle: Initiated → Pending → Processing → Settled.

---

## AI Assistant

### Overview

The built-in AI Assistant is your personal business helper with persistent memory. It can answer questions about your business, draft emails, extract information from text, and generate code.

### Using the AI Assistant

Navigate to AI & Agents > AI Assistant to open the chat interface. The assistant maintains conversation history and long-term memory about your business context.

**Key Capabilities:**

The assistant can help with drafting client communications, analyzing business data, generating reports, answering questions about your accounts and deals, and providing recommendations based on your pipeline status.

**Memory System:** The AI stores key facts you tell it (client preferences, business rules, pricing) in long-term memory. This means it remembers context across conversations. You can manage stored memories in the AI Memory section.

### Conversations

Each conversation is saved with a title and full message history. You can create new conversations for different topics or continue existing ones.

---

## Building Client Agents

This is one of the most powerful features of NexusCommand — building custom AI chatbots for your clients that are trained on their specific business data.

### Step 1: Create the Agent

Navigate to AI & Agents > Client Agents and click **"New Agent."**

Fill in the following:

| Field | What to Enter |
|-------|--------------|
| Name | A descriptive name (e.g., "Smith Law Firm Assistant") |
| Description | What this agent does for the client |
| Client Name | The client this agent belongs to |
| System Prompt | Instructions that define the agent's personality and knowledge |
| Model | Leave as "default" unless you need a specific model |
| Monthly Fee | What you charge the client for this agent (e.g., $120.00) |
| Web Access | Enable if the agent should be able to search the web |

### Step 2: Write the System Prompt

The system prompt is the most important part — it defines how the agent behaves. Here's a template:

```
You are [Agent Name], the AI assistant for [Client Business Name].

About the business:
- [What the business does]
- [Key services/products]
- [Business hours]
- [Location]

Your role:
- Answer customer questions about [specific topics]
- Help customers [specific actions like booking, ordering, etc.]
- Always be professional and friendly
- If you don't know something, say "Let me connect you with our team" and provide the contact: [email/phone]

Important rules:
- Never make up information about pricing or availability
- Always confirm details before providing final answers
- Refer complex issues to the human team
```

### Step 3: Train the Agent

Navigate to the agent's Training Sources section. You can add three types of training data:

**File Upload:** Upload documents (PDFs, text files) containing the client's FAQs, product catalogs, service descriptions, policies, etc. The system extracts and processes the text content.

**URL Scraping:** Enter website URLs that contain relevant information. The system will scrape and process the content from those pages. This is great for pulling in existing website content, blog posts, or documentation.

**Direct Text:** Paste text directly — useful for quick additions like new FAQ answers, policy updates, or specific instructions.

### Step 4: Activate the Agent

Once training is complete, change the agent's status from "Draft" to **"Active."** The agent is now ready to be deployed.

### Step 5: Deploy the Agent

The agent can be deployed in two ways:

1. **Embedded in a Client Website** — Connect the agent to a website you build in the Websites module (see next section)
2. **Standalone Deployment URL** — Generate a deployment URL that the client can share or embed anywhere

### Step 6: Monitor Performance

Once active, the agent's analytics are tracked automatically (see the Analytics section below).

---

## Building Client Websites

### Step 1: Create the Website

Navigate to Websites > Client Websites and click **"New Website."**

| Field | What to Enter |
|-------|--------------|
| Name | Website name (e.g., "Smith Law Firm Website") |
| Domain | The client's domain (e.g., smithlaw.com) |
| Description | Purpose of the website |
| Client Name | The client this website belongs to |
| Template | Choose a starting template |
| Monthly Fee | What you charge for hosting/maintenance |
| Chatbot Enabled | Toggle ON to embed an AI agent |
| Chatbot Agent | Select which agent to embed (from your Client Agents) |

### Step 2: Configure Pages

The website builder uses a JSON-based page configuration system. Each page has a route, title, and content sections. The `pages` field stores the full site structure.

**Common Page Types:**

| Page | Route | Purpose |
|------|-------|---------|
| Home | / | Landing page with hero, services, CTA |
| About | /about | Company story, team, mission |
| Services | /services | Detailed service descriptions |
| Contact | /contact | Contact form, map, phone/email |
| FAQ | /faq | Frequently asked questions |

### Step 3: Enable the Chatbot

If you toggle "Chatbot Enabled" and select an agent, the website automatically gets a chat widget in the bottom-right corner. Visitors can click it to chat with the AI agent you built for that client.

**Chatbot Embed Code:** The system generates an embed code snippet that can also be placed on external websites the client already has.

### Step 4: Publish

Change the website status from "Draft" to **"Published."** The site goes live at the configured domain.

---

## Implementing Analytics

Analytics are the key to proving value to your clients and ensuring everything is functioning properly. NexusCommand tracks analytics at two levels: per-agent and per-website.

### How Analytics Are Collected

Analytics events are automatically recorded whenever:

| Event Type | Trigger | What's Recorded |
|-----------|---------|-----------------|
| page_view | Visitor loads a website page | Page URL, timestamp, visitor info |
| chat_message | User sends a message to an agent | Message count, conversation ID |
| chat_session | New chat conversation starts | Session duration, message count |
| agent_response | Agent replies to a user | Response time, success/failure |
| error | Something goes wrong | Error type, stack trace, entity |
| conversion | User completes a goal action | Conversion type, value |

### Viewing Analytics

Navigate to **Analytics** in the sidebar. You'll see a dashboard with:

**Agent Analytics:**
- Total interactions (conversations started)
- Messages processed
- Average response time
- Error rate
- Active sessions

**Website Analytics:**
- Total visits (unique visitors)
- Page views
- Bounce rate
- Average session duration
- Most visited pages
- Traffic sources

### Analytics for Clients

Each client's agent and website has its own analytics profile. When you log into the Admin Monitor, you can see all clients' performance at a glance, or drill down into individual client metrics.

### Setting Up Analytics Tracking

Analytics tracking is **automatic** for agents and websites created within NexusCommand. The system records events through the `analyticsEvents` table, which stores:

- The user (you) who owns the entity
- The entity type (agent or website)
- The entity ID
- The event type
- Metadata (JSON with additional details)
- Timestamp

### Health Monitoring

Beyond basic analytics, the system performs health checks on your agents and websites:

| Status | Meaning | Action |
|--------|---------|--------|
| Healthy | Responding normally, fast response times | No action needed |
| Degraded | Slow response times or intermittent errors | Investigate soon |
| Down | Not responding at all | Immediate attention required |

When a service goes down or becomes degraded, the system automatically creates an alert and sends you a push notification (configurable in Admin Monitor > Settings).

---

## Admin Monitor & Notifications

### Overview

The Admin Monitor is your central command center for monitoring all client services. Access it from the sidebar under "Admin" (requires admin role).

### Tabs

| Tab | Shows |
|-----|-------|
| Clients | Overview of all clients with their agents, websites, and billing status |
| Agents | Detailed view of all agents with interaction counts and status |
| Websites | All websites with visit counts and uptime status |
| Health | Real-time health checks with response times |
| Alerts | All alerts (critical, warning, info) with resolve/dismiss actions |
| Settings | Notification preferences configuration |

### Notification Settings

In the Settings tab, configure:

- **Real-Time Notifications:** Enable/disable push notifications
- **Minimum Severity:** Choose to be notified only for Critical, Warning+, or all Info+ events
- **Cooldown Period:** Prevent notification spam (5 min to 24 hours between notifications for the same entity)

### Alert Flow

The complete alert flow works as follows:

1. Health check detects an issue (degraded or down)
2. System creates an alert record with severity level
3. System checks your notification preferences
4. If severity meets threshold and cooldown has passed, notification is sent
5. You receive the notification and can investigate
6. Mark the alert as read or resolved once handled

---

## Stripe Integration

### Setting Up Stripe

Your Stripe API keys are configured in the environment variables. Once set, you can:

### Products

Create products that represent your service offerings:

- **One-Time Products:** Setup fees, one-time builds, consulting hours
- **Subscription Products:** Monthly hosting, agent maintenance, website management

**Creating a Product:** Navigate to Commerce > Products and click "New Product." Enter the name, description, price, currency, and type (one-time or subscription). For subscriptions, set the billing interval (weekly, monthly, yearly).

### Checkout & Orders

When a client is ready to pay, create a checkout session that generates a Stripe payment link. The client clicks the link, enters their payment details, and the order is recorded automatically.

### Subscriptions

For recurring billing, create subscriptions tied to products. The system tracks:
- Subscription status (active, cancelled, past due)
- Current billing period end date
- Cancel at period end flag

---

## One-Click Deployment

### For New Client Instances

When a client signs up and you need to deploy their services, the process is streamlined:

**Step 1:** Build their agent and/or website in NexusCommand (as described above)

**Step 2:** If deploying a standalone instance for the client, use the deploy script:

```bash
# Clone the saas-platform branch
git clone -b saas-platform https://github.com/mymomma1975-art/digitalpursuits.git client-name

# Navigate to the directory
cd client-name

# Copy and configure environment
cp deploy/env-template.txt .env
nano .env  # Fill in client-specific API keys

# Deploy with one command
./deploy/deploy-vps.sh
```

**Step 3:** Point the client's domain to the server (see "Connecting Client Domains" below)

### For Updates

When you update an agent's training data, change a website's content, or modify any configuration, the changes take effect immediately within the NexusCommand platform — no redeployment needed for hosted clients.

---

## Hosting on Your Platform

### Multi-Tenant Architecture

NexusCommand supports hosting multiple clients on a single platform instance. This is the most cost-effective approach:

**How it works:** All clients share the same NexusCommand installation, but their data is completely isolated by user ID. Each client's agents, websites, and analytics are only visible to them (and to you as admin).

**Advantages:**
- One server to maintain
- One database to backup
- Lower cost per client
- Easier updates (update once, everyone benefits)

### Dedicated Instance Architecture

For clients who need complete isolation (enterprise clients, compliance requirements), deploy a separate NexusCommand instance:

**How it works:** Each client gets their own server, database, and domain. They have full admin access to their own instance.

**Advantages:**
- Complete data isolation
- Client can customize freely
- No shared resource concerns
- Higher perceived value (justifies higher pricing)

### Choosing the Right Approach

| Factor | Multi-Tenant (Shared) | Dedicated Instance |
|--------|----------------------|-------------------|
| Cost to you | $5-10/month total | $10-20/month per client |
| Setup time | Minutes (just create accounts) | 30-60 minutes per client |
| Maintenance | One system to update | Each instance separately |
| Best for | Standard service clients | Enterprise/premium clients |
| Pricing to charge | $120/month | $250-500/month |

---

## Connecting Client Domains

### Option A: Client Hosts on Your Platform (Subdomain)

The simplest approach — give clients a subdomain on your domain:

```
clientname.yourdomain.com
```

**Setup Steps:**
1. In your DNS provider, create an A record: `clientname.yourdomain.com → your-server-IP`
2. Configure Nginx to route that subdomain to the client's service
3. Run certbot to get SSL: `sudo certbot --nginx -d clientname.yourdomain.com`

### Option B: Client Uses Their Own Domain

When a client has their own domain (e.g., `smithlaw.com`) and wants it pointed to your platform:

**Step 1 — Client Action:** The client logs into their domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and creates an A record:

```
Type: A
Name: @ (or www)
Value: YOUR-SERVER-IP-ADDRESS
TTL: 300
```

**Step 2 — Your Action:** Add the domain to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name smithlaw.com www.smithlaw.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Step 3 — SSL Certificate:**

```bash
sudo certbot --nginx -d smithlaw.com -d www.smithlaw.com
```

**Step 4 — Verify:** Visit `https://smithlaw.com` to confirm it loads the client's website/agent.

### Option C: Client Deploys on Their Own Server

For clients who want full control, provide them with the deployment package:

1. Export their agent configuration and website data
2. Provide the deploy script and environment template
3. They deploy on their own infrastructure
4. You provide ongoing support/maintenance as a service

---

## Client Management Workflow

### The Complete Flow: From Intake to Deployment

Here is the end-to-end workflow for onboarding a new client:

**1. Client Fills Out Intake Form** → You receive their requirements (business type, services needed, deployment preference)

**2. You Create Their Services in NexusCommand:**
- Add them as a Contact in CRM
- Create a Deal in your pipeline
- Build their AI Agent (with training data from their intake form)
- Build their Website (if requested)
- Enable analytics tracking (automatic)

**3. You Deploy Their Services:**
- If hosting on your platform: Just activate the agent/website — done
- If dedicated instance: Run the deploy script on a new VPS
- If client self-hosts: Provide the deployment package

**4. You Connect Their Domain:**
- Follow the domain connection steps above
- Verify SSL is working
- Test the agent and website

**5. You Set Up Billing:**
- Create a Stripe subscription for the client
- Set up recurring billing at your agreed rate
- Invoice is sent automatically each month

**6. You Monitor Performance:**
- Check the Admin Monitor daily
- Review analytics weekly
- Address any alerts immediately
- Provide monthly performance reports to clients

### Monthly Client Report Template

Each month, pull these metrics from Analytics for each client:

| Metric | Where to Find |
|--------|--------------|
| Agent conversations | Analytics > Agent > Total Interactions |
| Agent response time | Analytics > Agent > Avg Response Time |
| Website visits | Analytics > Website > Total Visits |
| Website page views | Analytics > Website > Page Views |
| Uptime percentage | Admin Monitor > Health |
| Issues resolved | Admin Monitor > Alerts (resolved count) |

---

## Quick Reference Card

### Keyboard Shortcuts

| Action | Where |
|--------|-------|
| New Contact | CRM > Contacts > "Add Contact" button |
| New Agent | AI & Agents > Client Agents > "New Agent" button |
| New Website | Websites > Client Websites > "New Website" button |
| View Analytics | Analytics (sidebar) |
| Admin Monitor | Admin (sidebar, admin role only) |
| New Invoice | Accounting > Invoices > "Create Invoice" button |

### Status Meanings

| Status | Color | Meaning |
|--------|-------|---------|
| Active/Healthy | Green | Everything working normally |
| Draft | Gray | Not yet deployed/published |
| Degraded | Yellow/Orange | Performance issues, investigate |
| Down | Red | Not responding, immediate action needed |
| Paused | Blue | Intentionally stopped |
| Archived | Gray | No longer in use |

---

*This guide covers the complete NexusCommand platform. For deployment-specific instructions, refer to the Deployment Guide. For client intake, use the Client Intake Form.*
