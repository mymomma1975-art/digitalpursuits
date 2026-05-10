# NexusCommand — Manual Client Deployment & Management Guide

This guide covers how to deploy NexusCommand for paying clients on the Manus platform, manage multiple client instances, and troubleshoot issues.

---

## Quick Start: Deploying Your First Client

### Step 1: Client Signs Up

1. Client fills out the **Client Intake Form** (included in `/docs/presentations/`)
2. They select their pricing tier: **Starter ($120/month)**, **Growth ($199/month)**, or **Enterprise ($349/month)**
3. They provide their domain (e.g., `client.example.com`)
4. You receive their requirements and domain information

### Step 2: Create Client Instance

Each client gets their own isolated copy of NexusCommand running on the Manus platform.

**Option A: Clone from GitHub (Recommended)**

```bash
# Clone the saas-platform branch
git clone -b saas-platform https://github.com/mymomma1975-art/digitalpursuits.git client-name-instance

# Navigate to the project
cd client-name-instance

# Install dependencies
pnpm install

# Set up environment variables (see below)
cp .env.example .env
nano .env
```

**Option B: Use Manus UI**

1. Go to your Manus dashboard
2. Click "New Project"
3. Select "Web App Template"
4. Name it: `client-name-nexuscommand`
5. Clone the code from GitHub into the project

### Step 3: Configure Environment Variables

Each client instance needs its own database and configuration. Update `.env`:

```bash
# Database (create a new MySQL database for this client)
DATABASE_URL=mysql://user:password@host:3306/client_name_db

# Stripe (use your sandbox keys for testing, live keys for production)
STRIPE_SECRET_KEY=sk_test_51TUssaBFk6HACNI1...
STRIPE_PUBLISHABLE_KEY=pk_test_51TUssaBFk6HACNI1...

# OAuth (same for all instances)
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT Secret (generate a unique one for each client)
JWT_SECRET=$(openssl rand -hex 32)

# Manus Built-in APIs (same for all instances)
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### Step 4: Deploy on Manus Platform

**Using Manus CLI:**

```bash
# Deploy to Manus
manus deploy --name client-name-nexuscommand

# This creates a live URL: https://client-name-nexuscommand.manus.space
```

**Or via Manus UI:**

1. Go to Management UI → Settings → Domains
2. Note your auto-generated domain: `client-name-nexuscommand.manus.space`
3. Click "Publish" to go live

### Step 5: Connect Client's Custom Domain

Your client wants their instance at `client.example.com` instead of the Manus subdomain.

**For Client to Do:**

1. Log into their domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Create a **CNAME record**:
   - Name: `client` (or `@` for root domain)
   - Value: `client-name-nexuscommand.manus.space`
   - TTL: 3600 (or default)
4. Save and wait 5-30 minutes for DNS to propagate

**For You to Do (in Manus):**

1. Go to Management UI → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `client.example.com`
4. Manus auto-generates an SSL certificate (free)
5. Your client's instance is now live at `https://client.example.com`

### Step 6: Create Client Account

1. Visit the client's domain (e.g., `https://client.example.com`)
2. Click "Sign Up" or "Create Account"
3. Create a master admin account for the client
4. Send them login credentials securely

### Step 7: Set Up Billing

1. Go to Admin Monitor → Billing
2. Create a subscription for the client at their chosen tier
3. Send them an invoice using the **AI Invoice Generator** in the Copilot
4. Set up recurring billing (Stripe handles this automatically)

---

## Managing Multiple Client Instances

### Monitoring All Clients

**From Your Admin Dashboard:**

1. Log into your main NexusCommand instance (the one you own)
2. Go to **Admin Monitor** (sidebar)
3. View all clients at a glance:
   - Client name and status
   - Active agents and websites
   - System health (uptime, response time)
   - Revenue per client
   - Alerts (if anything is down)

### Accessing a Client's Instance

If a client reports an issue or you need to troubleshoot:

1. Go to Admin Monitor → Clients
2. Click on the client's name
3. Click "View Instance" — you're logged in as admin
4. You can now see their data, agents, websites, and analytics

### Generating Client Invoices

**Using the AI Copilot:**

1. Go to **Copilot** → **Invoices** tab
2. Click "Generate Invoice with AI"
3. Fill in:
   - Client name
   - Subscription tier (Starter/Growth/Enterprise)
   - Billing period (e.g., May 1 - May 31)
4. The AI generates a professional invoice automatically
5. Click "Save Invoice" — it's stored in the database
6. Send to client via email

### Tracking Client Usage

**Per-Client Analytics:**

Each client instance has its own analytics dashboard showing:

- **Agents**: Conversations handled, response times, user satisfaction
- **Websites**: Page views, unique visitors, bounce rate, chatbot usage
- **CRM**: Contacts, deals, pipeline value
- **Accounting**: Revenue, expenses, P&L

You can view this from the Admin Monitor to ensure clients are getting value.

---

## Troubleshooting Common Issues

### Issue 1: Client Can't Log In

**Symptoms:** Client receives "Invalid credentials" or "Account not found"

**Solution:**

1. Verify the client's account exists in the database
2. Reset their password:
   - Go to client's instance
   - Click "Forgot Password"
   - Send them the reset link
3. If still failing, check if their instance is running:
   - Go to Admin Monitor → System Health
   - Look for their instance status

### Issue 2: Client's Domain Not Connecting

**Symptoms:** `client.example.com` shows "Connection refused" or "Not found"

**Solution:**

1. Verify DNS is set up correctly:
   ```bash
   nslookup client.example.com
   # Should return: client-name-nexuscommand.manus.space
   ```

2. Wait for DNS propagation (can take up to 30 minutes):
   ```bash
   # Check DNS propagation status
   dig client.example.com
   ```

3. If DNS is correct but still not working:
   - Go to Manus Management UI → Domains
   - Verify the custom domain is added
   - Re-add it if needed
   - Wait 5 minutes and try again

### Issue 3: Client's Instance is Slow

**Symptoms:** Pages take 5+ seconds to load

**Solution:**

1. Check system health from Admin Monitor
2. Look for high response times or errors
3. Common causes:
   - Database query is slow (check Transactions page)
   - Too many agents/websites running (check limits)
   - Stripe API is slow (temporary, usually resolves itself)

4. If database is slow:
   - Check if client has exceeded their agent/website limit
   - Optimize queries or add database indexes

### Issue 4: Stripe Billing Not Working

**Symptoms:** Client can't subscribe or checkout fails

**Solution:**

1. Verify Stripe keys are correct in `.env`
2. Check Stripe dashboard for errors:
   - Go to https://dashboard.stripe.com
   - Look for failed charges or webhook errors
3. Test checkout flow:
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/25)
   - Any 3-digit CVC (e.g., 123)
4. If test card works but real cards don't, you're using sandbox keys — switch to live keys

### Issue 5: Client's Agent Isn't Responding

**Symptoms:** Chatbot is offline or returning errors

**Solution:**

1. Check agent status from Admin Monitor
2. Verify the agent has training data:
   - Go to client's instance → Agents
   - Click on the agent
   - Check if training data is uploaded
3. If training data is missing, ask client to upload it
4. Restart the agent:
   - Go to agent settings
   - Click "Restart Agent"
5. If still failing, check LLM integration:
   - Verify `BUILT_IN_FORGE_API_KEY` is correct
   - Test the LLM with a simple query

### Issue 6: Client's Website Chatbot Not Showing

**Symptoms:** Chatbot embed code isn't displaying on client's website

**Solution:**

1. Verify embed code is correct:
   - Go to client's instance → Websites
   - Copy the embed code
   - Paste it into client's website HTML (before closing `</body>` tag)
2. Check for JavaScript errors:
   - Open browser console (F12)
   - Look for red errors
   - Common issue: CORS blocking (verify domain is whitelisted)
3. Verify website is live:
   - Check if client's website is actually running
   - Test from a different browser/device

---

## Client Onboarding Checklist

Use this checklist when onboarding a new client:

- [ ] Client fills out intake form
- [ ] Create client instance on Manus
- [ ] Configure environment variables
- [ ] Deploy instance (get live URL)
- [ ] Connect client's custom domain
- [ ] Create client admin account
- [ ] Send login credentials
- [ ] Set up Stripe subscription
- [ ] Generate first invoice
- [ ] Schedule onboarding call with client
- [ ] Help client build their first agent
- [ ] Help client create their first website
- [ ] Test agent and website thoroughly
- [ ] Go live with client
- [ ] Schedule 30-day check-in

---

## Database Management

### Creating a Database for Each Client

Each client needs their own MySQL database. You can use:

**Option 1: Manus Managed Database**

1. Go to Management UI → Database
2. Click "Create New Database"
3. Name it: `client_name_db`
4. Note the connection string
5. Add to client's `.env` as `DATABASE_URL`

**Option 2: External Database (DigitalOcean, AWS RDS, etc.)**

1. Create a new MySQL database
2. Get the connection string
3. Add to client's `.env` as `DATABASE_URL`

### Running Migrations for Each Client

When you deploy a new client instance, run database migrations:

```bash
cd client-instance-directory

# Generate migrations (if schema changed)
pnpm drizzle-kit generate

# Apply migrations to client's database
pnpm drizzle-kit migrate
```

### Backing Up Client Data

**Manual Backup:**

```bash
# Export client database
mysqldump -u user -p database_name > client_backup_$(date +%Y%m%d).sql

# Store securely (e.g., AWS S3, Google Drive)
```

**Automated Backup (Recommended):**

Set up a cron job to backup daily:

```bash
# Add to crontab
0 2 * * * mysqldump -u user -p database_name | gzip > /backups/client_$(date +\%Y\%m\%d).sql.gz
```

---

## Scaling to Multiple Clients

### Managing 5-10 Clients

At this scale, manual management is feasible:

1. Keep a spreadsheet of all client instances (domain, database, status)
2. Check Admin Monitor daily for alerts
3. Schedule weekly check-ins with each client
4. Use the AI Copilot to generate invoices monthly

### Managing 20+ Clients

At this scale, you'll need automation:

1. Build an automated deployment system (I can help with this)
2. Implement usage limits enforcement (prevent abuse)
3. Set up automated monitoring and alerts
4. Create a support ticketing system
5. Automate invoice generation and billing

---

## Revenue Tracking

### Monthly Revenue

Track your revenue from the Admin Monitor:

1. Go to Admin Monitor → Revenue
2. See total revenue across all clients
3. See revenue per client
4. See churn (clients who cancelled)

**Example:**
- 5 clients on Starter plan ($120/month) = $600/month
- 2 clients on Growth plan ($199/month) = $398/month
- 1 client on Enterprise plan ($349/month) = $349/month
- **Total: $1,347/month**

### Costs

Your monthly costs:

| Item | Cost |
|------|------|
| Manus hosting (per client) | $10-20 |
| Database (per client) | $5-15 |
| Stripe fees (2.9% + $0.30) | ~$40 (on $1,347 revenue) |
| API costs (LLM, Plaid, etc.) | $50-100 |
| **Total for 8 clients** | **$200-250** |

**Your Profit:** $1,347 - $250 = **$1,097/month** (81% margin)

---

## Next Steps

1. **Get your first paying client** — Use the client intake form and onboarding checklist
2. **Deploy their instance** — Follow steps 1-7 above
3. **Monitor and support** — Use Admin Monitor and troubleshooting guide
4. **Collect feedback** — Ask what's working and what needs improvement
5. **Scale gradually** — Add clients one at a time, refine your process
6. **Automate later** — Once you have 10+ clients, build automation features

---

## Support & Questions

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the **Complete User Guide** in `/docs/guides/`
3. Check the **Deployment Guide** in `/docs/guides/`
4. Contact Manus support at https://help.manus.im

Good luck with your first clients! 🚀
