# Business SaaS Platform - TODO

## Phase 1: Foundation
- [x] Database schema design (all tables)
- [x] Global theming (dark dashboard theme, color palette)
- [x] DashboardLayout with sidebar navigation
- [x] App routing structure

## Phase 2: CRM Module
- [x] Contacts management (CRUD, search, tags)
- [x] Pipelines with drag-drop stages
- [x] Deals tracking with values and status
- [x] Client management with notes and history

## Phase 3: Accounting Module
- [x] Chart of accounts / General ledger
- [x] Invoice creation and management
- [x] Transaction recording and categorization
- [x] Financial reports (P&L, Balance Sheet)
- [x] Expense tracking

## Phase 4: Banking & Payments
- [x] Plaid integration (sandbox) for bank connections
- [x] Modern Treasury integration for ACH/wire/RTP
- [x] Credit card processing with pending transactions
- [x] Payment tracking with transaction numbers
- [x] Bank account sync and reconciliation

## Phase 5: AI Assistant
- [x] AI chat interface with memory retention
- [x] Email payment info extraction (tracking/transfer numbers)
- [x] Code generation capability
- [x] Conversation history persistence

## Phase 6: Client Agent & Website Builder
- [x] Agent builder with training (file upload + internet/URL scraping)
- [x] Agent deployment and management
- [x] Website builder for clients
- [x] Embeddable chatbot widget with internet access training
- [x] 1-click agent/website deployment

## Phase 7: Analytics & Billing
- [x] Per-client analytics dashboard (agent usage, website traffic)
- [x] Client billing management (monthly subscriptions)
- [x] Revenue tracking and reporting
- [x] Agent/website health monitoring

## Phase 8: Deployment & Portability
- [x] Docker + Docker Compose for portable 1-click deployment
- [x] Self-hosted deployment scripts (AWS + any VPS)
- [x] Multi-tenant subscription billing system
- [x] Environment-based configuration for independent deployments
- [x] Deployment documentation with step-by-step instructions
- [x] Exportable/copyable codebase structure

## Phase 9: Testing
- [x] Vitest tests for all routers (60 tests passing)

## Phase 10: Stripe Payment Integration
- [x] Add Stripe feature scaffold (webdev_add_feature)
- [x] Database tables for products, prices, subscriptions, orders
- [x] Stripe checkout session creation (one-time + subscription)
- [x] Stripe webhook handler for payment events
- [x] Products & pricing management page
- [x] Customer subscription management page
- [x] Order history and payment status tracking
- [x] Stripe Connect for client billing automation
- [x] Vitest tests for Stripe routers (70 tests total, all passing)

## Bug Fixes
- [x] Fix sidebar navigation labels overlapping / too close together
- [x] Fix sidebar labels STILL overlapping — rebuilt with custom HTML buttons, py-2.5 per item, gap-1 between items, pt-4 per group, explicit dividers

## This Copy - Tasks
- [x] Fix dev server (tsx path issue due to colon in directory name)
- [ ] Export code to GitHub repo mymomma1975-art/digitalpursuits on branch saas-platform
