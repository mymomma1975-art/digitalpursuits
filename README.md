# NexusCommand — AI-Powered Business Platform

**Digital Pursuits | Complete Business Management + AI Assistant + Website Builder**

NexusCommand is a comprehensive SaaS platform that combines CRM, accounting, payment processing, AI chatbots, website building, real-time analytics, and an intelligent AI Copilot into one unified system. Built for small businesses and entrepreneurs who want to scale without managing multiple tools.

---

## 🚀 What's Included

### Core Features

| Feature | Description |
|---------|-------------|
| **AI Chatbot Agent** | Custom AI trained on your business data. Answers customer questions 24/7, handles unlimited conversations, learns your brand voice. |
| **Professional Website** | Beautiful, mobile-responsive website with embedded chatbot, contact forms, booking integration, and SEO optimization. |
| **CRM System** | Organize clients, track deals, manage pipelines, never lose a lead. Full conversation history and contact management. |
| **Invoicing & Billing** | Create professional invoices, track payments, automate reminders, accept multiple payment methods. |
| **Accounting** | Chart of accounts, transaction tracking, P&L reports, balance sheets, financial dashboards. |
| **Payment Processing** | Accept ACH transfers, wire payments, credit cards, and RTP (Real-Time Payments). |
| **Banking Integration** | Connect Plaid for bank feeds, Modern Treasury for advanced payment routing. |
| **Analytics Dashboard** | Real-time metrics on agent performance, website traffic, customer behavior, and business KPIs. |
| **Admin Monitor** | Master dashboard for managing multiple client instances, health checks, alerts, and system monitoring. |
| **Email Notifications** | Real-time alerts for critical issues (agent down, website down, degraded services). |
| **AI Copilot** | Intelligent assistant with memory retention, internet access, and platform knowledge. Helps you build agents, create websites, optimize analytics, and troubleshoot issues. |

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui components |
| **Backend** | Express 4, tRPC 11 (type-safe RPC) |
| **Database** | MySQL/TiDB with Drizzle ORM |
| **Authentication** | Manus OAuth (built-in) |
| **Storage** | AWS S3 (file uploads, media) |
| **LLM Integration** | Built-in LLM helpers (Claude/GPT) with internet access |
| **Real-Time** | Socket.io ready (optional) |
| **Testing** | Vitest with full coverage (93+ tests) |
| **Deployment** | Docker, AWS, DigitalOcean, Render, Railway compatible |

---

## 🏗️ Project Structure

```
nexus-command/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── AdminMonitor.tsx    # Master admin dashboard
│   │   │   ├── Copilot.tsx         # AI Copilot assistant
│   │   │   ├── CRM.tsx
│   │   │   ├── Invoicing.tsx
│   │   │   ├── Accounting.tsx
│   │   │   └── Analytics.tsx
│   │   ├── components/             # Reusable UI components
│   │   │   ├── DashboardLayout.tsx # Sidebar navigation
│   │   │   ├── AIChatBox.tsx       # Chat interface
│   │   │   ├── Map.tsx             # Google Maps integration
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── lib/
│   │   │   └── trpc.ts             # tRPC client setup
│   │   ├── contexts/               # React contexts
│   │   ├── hooks/                  # Custom hooks
│   │   └── index.css               # Global styles
│   └── public/                     # Static files
├── server/                          # Express backend
│   ├── routers.ts                  # tRPC procedure definitions
│   ├── db.ts                       # Database query helpers
│   ├── copilot.ts                  # AI Copilot service with memory
│   ├── alertNotifier.ts            # Alert notification service
│   ├── _core/                      # Framework internals
│   │   ├── index.ts                # Express server setup
│   │   ├── context.ts              # tRPC context
│   │   ├── trpc.ts                 # tRPC router setup
│   │   ├── auth.ts                 # OAuth handling
│   │   ├── llm.ts                  # LLM integration
│   │   ├── imageGeneration.ts      # Image generation
│   │   ├── voiceTranscription.ts   # Audio transcription
│   │   ├── notification.ts         # Notification system
│   │   ├── map.ts                  # Maps integration
│   │   └── env.ts                  # Environment variables
│   └── *.test.ts                   # Vitest test files
├── drizzle/                         # Database schema
│   ├── schema.ts                   # Table definitions
│   └── migrations/                 # SQL migration files
├── storage/                         # S3 storage helpers
│   └── index.ts                    # File upload/download
├── shared/                          # Shared types & constants
│   ├── const.ts
│   └── types.ts
├── docker-compose.yml              # Local MySQL setup
├── Dockerfile                       # Production container
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind configuration
└── vitest.config.ts                # Test configuration
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ or TiDB
- Docker (optional, for local MySQL)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone -b saas-platform https://github.com/mymomma1975-art/digitalpursuits.git
   cd digitalpursuits
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MySQL (using Docker):**
   ```bash
   docker-compose up -d
   ```

5. **Apply database migrations:**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

6. **Start development server:**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:5173`

7. **Run tests:**
   ```bash
   pnpm test
   ```

---

## 🔧 Environment Variables

Required environment variables (automatically injected in production):

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/nexuscommand

# Authentication
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Information
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# Built-in APIs (Manus)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Configuration
VITE_APP_TITLE=NexusCommand
VITE_APP_LOGO=https://...
```

---

## 📊 Database Schema

Key tables:

- **users** — User accounts and authentication
- **clients** — Client instances (for multi-tenant setup)
- **agents** — AI chatbot configurations
- **websites** — Website builder data
- **conversations** — Chat history
- **contacts** — CRM contacts
- **deals** — Sales pipeline
- **invoices** — Billing records
- **transactions** — Accounting entries
- **systemHealth** — Server health monitoring
- **alerts** — System alerts and notifications
- **notificationPreferences** — User alert settings
- **copilotConversations** — AI Copilot chat sessions
- **copilotMessages** — Individual copilot messages with memory
- **copilotKnowledgeBase** — Platform documentation for copilot
- **copilotSuggestions** — AI-generated improvement suggestions

---

## 🤖 Using the AI Copilot

The AI Copilot is your intelligent assistant available in the sidebar. It helps you:

### Features

- **Memory Retention** — Remembers previous messages in each conversation (last 5 messages)
- **Internet Access** — Can search the web for additional information
- **Platform Knowledge** — Trained on all NexusCommand documentation
- **Context Awareness** — Knows what page you're on and what you're building
- **Multiple Topics** — Specialized help for agent building, website creation, analytics, and troubleshooting

### How to Use

1. Click the **Copilot** icon in the sidebar
2. Select a topic (Agent Building, Website Creation, Analytics, Troubleshooting, or General)
3. Ask your question
4. The copilot will respond with actionable advice
5. Continue the conversation — it remembers context

### Example Questions

- "How do I build an AI agent that answers customer support questions?"
- "What training data should I provide to make my agent more effective?"
- "How do I embed my website chatbot on my site?"
- "Why is my agent's response time slow?"
- "How do I optimize my website for better SEO?"

---

## 🤖 Building an AI Agent

1. **Create agent in Admin Panel:**
   - Name, description, and personality
   - Upload training data (FAQs, documents, URLs)
   - Configure response behavior and escalation

2. **Train on your data:**
   - Upload PDF, Word, or text files
   - Paste FAQ content directly
   - Provide URLs for web scraping
   - The AI learns from all provided data

3. **Test and refine:**
   - Chat with your agent in the preview
   - Adjust personality and responses
   - Add more training data as needed

4. **Deploy:**
   - Get embed code for your website
   - Share public link with customers
   - Monitor performance in Analytics

---

## 🌐 Building a Website

1. **Create website in Website Builder:**
   - Choose pages (Home, About, Services, Contact, etc.)
   - Customize colors, fonts, and layout
   - Add your content and images

2. **Embed your AI agent:**
   - Chatbot widget appears automatically
   - Customizable position and appearance
   - Handles unlimited conversations

3. **Configure domain:**
   - Point your domain to our servers, or
   - Deploy to your own server

4. **Go live:**
   - Website is immediately accessible
   - AI agent starts answering questions
   - Analytics tracking begins

---

## 📈 Monitoring & Analytics

### Admin Monitor Dashboard

Access at `/admin/monitor` (admin users only):

- **Overview** — Total clients, revenue, active agents, website traffic
- **Client Health** — Per-client system status, uptime, performance
- **Agent Metrics** — Conversations, response times, resolution rates
- **Website Stats** — Visitors, page views, bounce rates, traffic sources
- **Alerts** — Real-time notifications for critical issues
- **Settings** — Configure notification preferences and thresholds

### Per-Client Analytics

Each client instance has its own analytics dashboard showing:

- Agent conversation metrics
- Website visitor analytics
- CRM pipeline status
- Invoicing and payment tracking
- Financial reports

---

## 🚢 Deployment

### Option 1: Deploy to Our Servers (Recommended)

We host everything. You just manage clients and billing.

```bash
# We handle deployment
# You manage via Admin Monitor
```

### Option 2: Deploy to AWS

```bash
# Follow the deployment guide in docs/guides/
chmod +x deploy/deploy-aws.sh
./deploy/deploy-aws.sh
```

### Option 3: Deploy to DigitalOcean / Vultr / Linode

```bash
# Follow the deployment guide
chmod +x deploy/deploy-vps.sh
./deploy/deploy-vps.sh
```

### Option 4: Deploy to Docker

```bash
docker build -t nexuscommand .
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e JWT_SECRET=... \
  nexuscommand
```

---

## 🔐 Security

- **SSL/HTTPS** — All connections encrypted
- **Daily backups** — Automated database backups
- **99.9% uptime** — Redundant infrastructure
- **Real-time monitoring** — Instant alerts for issues
- **Data privacy** — Your data stays yours, never shared

---

## 📚 Documentation

- **[Complete User Guide](./docs/guides/NexusCommand-Complete-User-Guide.md)** — All features and how to use them
- **[Client Intake Form](./docs/guides/NexusCommand-Client-Intake-Form.md)** — Gather client requirements
- **[Deployment Guide](./docs/guides/NexusCommand-Deployment-Guide.md)** — Step-by-step deployment instructions
- **[Client Presentation](./docs/presentations/nexuscommand-client-presentation/)** — 14-slide sales deck
- **[Infographics](./docs/guides/)** — Architecture and workflow diagrams

---

## 💰 Pricing

| Plan | Price | Includes |
|------|-------|----------|
| **Starter** | $120/month | 1 user, AI agent, website, CRM, invoicing, analytics, copilot |
| **Growth** | $199/month | Up to 5 users, all features, priority support |
| **Enterprise** | $349/month | Unlimited users, white-label, custom AI training, dedicated support |

**No contracts. Cancel anytime. 30-day free trial.**

---

## 🧪 Testing

Run the full test suite (93+ tests):

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test --watch
```

Run tests for a specific file:

```bash
pnpm test server/copilot.test.ts
```

---

## 🛠️ Development Workflow

1. **Update database schema** in `drizzle/schema.ts`
2. **Generate migration** with `pnpm drizzle-kit generate`
3. **Apply migration** with `pnpm drizzle-kit migrate`
4. **Add query helpers** in `server/db.ts`
5. **Create tRPC procedures** in `server/routers.ts`
6. **Build UI** in `client/src/pages/`
7. **Write tests** in `server/*.test.ts`
8. **Test locally** with `pnpm dev`
9. **Deploy** with `pnpm build` and deployment script

---

## 📞 Support & Contact

- **Email:** hello@digitalpursuits.com
- **Website:** digitalpursuits.com
- **GitHub Issues:** [Report bugs](https://github.com/mymomma1975-art/digitalpursuits/issues)

---

## 📄 License

This project is proprietary software. All rights reserved. Unauthorized copying or distribution is prohibited.

---

## 🙏 Acknowledgments

Built with:
- React, Express, tRPC, Drizzle ORM
- Tailwind CSS, shadcn/ui
- Manus OAuth & APIs
- AWS, Docker, and open-source community

---

**NexusCommand — Empowering small businesses with enterprise-grade tools.**

*Let your AI handle the repetitive work so you can focus on growing your business.*
