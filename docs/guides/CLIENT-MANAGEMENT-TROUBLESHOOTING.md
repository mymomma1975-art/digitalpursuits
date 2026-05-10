# NexusCommand Client Management & Troubleshooting Guide

This guide helps you manage your paying clients and troubleshoot common issues that may arise.

---

## Client Management Overview

As the platform owner, you have complete visibility and control over all client instances through the **Admin Monitor** dashboard.

### Accessing Admin Monitor

1. Log into your main NexusCommand instance (the one you own)
2. Click **Admin Monitor** in the sidebar
3. You see all your clients at a glance

### What You Can See

| Section | What It Shows |
|---------|---------------|
| **Overview** | Total clients, monthly revenue, active agents, website traffic |
| **Clients** | List of all clients, their status, tier, and revenue |
| **System Health** | Uptime, response times, error rates for each client instance |
| **Agent Metrics** | Conversations handled, response times, satisfaction scores |
| **Website Stats** | Page views, visitors, bounce rates, chatbot usage |
| **Alerts** | Real-time notifications of issues (agent down, slow response, etc.) |
| **Billing** | Subscriptions, invoices, payments, revenue tracking |

---

## Daily Client Management Tasks

### Morning Check (5 minutes)

1. **Check Alerts**
   - Go to Admin Monitor → Alerts
   - Look for any red alerts (critical issues)
   - If any alerts: investigate and fix immediately

2. **Check System Health**
   - Go to Admin Monitor → System Health
   - Verify all client instances are online
   - Check response times (should be <2 seconds)

3. **Check Revenue**
   - Go to Admin Monitor → Billing
   - Verify all subscriptions are active
   - Check for any failed payments

### Weekly Check (15 minutes)

1. **Review Client Performance**
   - Go to Admin Monitor → Clients
   - Click on each client
   - Review agent conversations and website traffic
   - Look for trends or issues

2. **Generate Invoices**
   - Go to Copilot → Invoices
   - Generate invoices for clients due this week
   - Send invoices to clients

3. **Check Support Requests**
   - Review any support emails or tickets
   - Prioritize urgent issues
   - Schedule time to help clients

### Monthly Check (30 minutes)

1. **Revenue Report**
   - Go to Admin Monitor → Revenue
   - Calculate total revenue
   - Compare to previous month
   - Identify top-performing clients

2. **Client Satisfaction**
   - Email each client asking for feedback
   - Ask what's working and what needs improvement
   - Schedule calls with clients who have feedback

3. **Performance Analysis**
   - Review agent metrics for all clients
   - Identify agents that need improvement
   - Plan improvements for next month

---

## Accessing a Client's Instance

Sometimes you need to log into a client's instance to help them or troubleshoot issues.

### Method 1: Direct Access (Recommended)

1. Go to Admin Monitor → Clients
2. Find the client you want to access
3. Click "View Instance"
4. You're automatically logged in as admin
5. You can now see everything the client sees

### Method 2: Using Client's Domain

1. Go to the client's domain (e.g., `https://client.example.com`)
2. Click "Sign In"
3. Use your master admin credentials
4. You're logged in as admin for that instance

### What You Can Do When Logged In

- ✅ View all client data (agents, websites, contacts, deals)
- ✅ Create or edit agents
- ✅ Create or edit websites
- ✅ View analytics and reports
- ✅ Manage invoices and billing
- ✅ Create or edit contacts
- ✅ View all conversations

### What You Should NOT Do

- ❌ Delete client data without permission
- ❌ Change client's password
- ❌ Access client's private information (emails, addresses)
- ❌ Make changes without telling the client
- ❌ Stay logged in longer than necessary

---

## Common Issues & Solutions

### Issue 1: Client Can't Log In

**Symptoms:** Client receives "Invalid credentials" or "Account not found"

**Diagnosis:**

1. Check if account exists:
   ```
   Go to Admin Monitor → Clients
   Search for client name
   If not found → Account doesn't exist
   ```

2. Check if account is active:
   ```
   Go to Admin Monitor → Clients
   Click on client
   Check "Account Status" (should be "Active")
   ```

3. Check if password is correct:
   ```
   Ask client to try "Forgot Password"
   They should receive reset email
   If no email → Email system issue
   ```

**Solution:**

**If account doesn't exist:**
1. Go to Admin Monitor → Clients
2. Click "Add New Client"
3. Fill in client information
4. Create admin account for client
5. Send login credentials to client

**If account is inactive:**
1. Go to Admin Monitor → Clients
2. Click on client
3. Click "Activate Account"
4. Send client notification

**If password reset isn't working:**
1. Go to Admin Monitor → Clients
2. Click on client
3. Click "Reset Password"
4. Manually send new password to client
5. Ask them to change it on first login

### Issue 2: Client's Domain Not Connecting

**Symptoms:** `client.example.com` shows "Connection refused" or "Not found"

**Diagnosis:**

1. Verify DNS is set up:
   ```bash
   nslookup client.example.com
   # Should return: client-name-nexuscommand.manus.space
   ```

2. Check if domain is configured in Manus:
   ```
   Go to Admin Monitor → Domains
   Look for client.example.com
   If not there → Domain not added
   ```

3. Check if SSL certificate is issued:
   ```
   Go to Admin Monitor → Domains
   Click on domain
   Check "SSL Status" (should be "Active")
   ```

**Solution:**

**If DNS is not set up:**
1. Send client this message:
   ```
   Please add this DNS record to your domain registrar:
   Name: client (or @ for root)
   Type: CNAME
   Value: client-name-nexuscommand.manus.space
   TTL: 3600
   ```
2. Wait 5-30 minutes for DNS to propagate
3. Test: `nslookup client.example.com`

**If domain is not in Manus:**
1. Go to Admin Monitor → Domains
2. Click "Add Custom Domain"
3. Enter: `client.example.com`
4. Manus auto-generates SSL certificate
5. Wait 5 minutes for certificate to activate

**If SSL certificate is not issued:**
1. Wait 10 minutes (certificates take time)
2. Go to Admin Monitor → Domains
3. Click on domain
4. Click "Reissue Certificate"
5. Wait 5 minutes and try again

### Issue 3: Client's Instance is Slow

**Symptoms:** Pages take 5+ seconds to load

**Diagnosis:**

1. Check system health:
   ```
   Go to Admin Monitor → System Health
   Look for client's instance
   Check "Response Time" (should be <2 seconds)
   ```

2. Check database performance:
   ```
   Go to Admin Monitor → Clients
   Click on client
   Go to "Database" tab
   Look for slow queries
   ```

3. Check if client exceeded limits:
   ```
   Go to Admin Monitor → Clients
   Click on client
   Check "Agents" count vs. tier limit
   Check "Websites" count vs. tier limit
   ```

**Solution:**

**If response time is high:**
1. Check if there's a database query issue
2. Optimize slow queries (contact Manus support if needed)
3. Consider upgrading client to higher tier (more resources)

**If client exceeded limits:**
1. Go to Admin Monitor → Clients
2. Click on client
3. Click "Upgrade Tier" (move to higher plan)
4. Send client invoice for upgrade
5. Response times should improve

**If database is slow:**
1. Go to Admin Monitor → Database
2. Click "Optimize Database"
3. This cleans up old data and improves performance
4. Wait 5-10 minutes
5. Test performance again

### Issue 4: Client's Agent Isn't Responding

**Symptoms:** Chatbot is offline or returning errors

**Diagnosis:**

1. Check agent status:
   ```
   Log into client's instance
   Go to Agents
   Click on agent
   Check "Status" (should be "Active")
   ```

2. Check if agent has training data:
   ```
   Go to Agents
   Click on agent
   Go to "Training Data" tab
   If empty → No training data
   ```

3. Check LLM integration:
   ```
   Go to Admin Monitor → System Health
   Look for "LLM Service" status
   If down → LLM service issue
   ```

**Solution:**

**If agent status is inactive:**
1. Log into client's instance
2. Go to Agents
3. Click on agent
4. Click "Activate Agent"
5. Wait 1 minute for agent to start

**If agent has no training data:**
1. Log into client's instance
2. Go to Agents
3. Click on agent
4. Go to "Training Data"
5. Upload training data (FAQs, documents, etc.)
6. Wait 2 minutes for training to complete
7. Test agent

**If LLM service is down:**
1. Go to Admin Monitor → System Health
2. Look for "LLM Service"
3. If status is "Down", click "Restart Service"
4. Wait 2 minutes for service to restart
5. Test agent again

### Issue 5: Client's Website Chatbot Not Showing

**Symptoms:** Chatbot embed code isn't displaying on client's website

**Diagnosis:**

1. Check if embed code is correct:
   ```
   Log into client's instance
   Go to Websites
   Click on website
   Go to "Embed Code" tab
   Copy the code
   ```

2. Check if code is in client's website:
   ```
   Go to client's website
   Open browser console (F12)
   Look for the embed script
   If not there → Code not added
   ```

3. Check for JavaScript errors:
   ```
   Open browser console (F12)
   Look for red errors
   Common issue: CORS blocking
   ```

**Solution:**

**If embed code is not in website:**
1. Send client the embed code:
   ```html
   <script src="https://client-name-nexuscommand.manus.space/embed.js"></script>
   ```
2. Tell them to paste it before closing `</body>` tag
3. Save and reload website
4. Chatbot should appear

**If CORS error in console:**
1. Log into client's instance
2. Go to Websites
3. Click on website
4. Go to "Settings"
5. Add client's website domain to "Allowed Domains"
6. Save and reload website

**If chatbot still not showing:**
1. Check if website is live (not local)
2. Check if chatbot is enabled for that website
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try different browser
5. Contact Manus support if still failing

### Issue 6: Stripe Billing Not Working

**Symptoms:** Client can't subscribe or checkout fails

**Diagnosis:**

1. Check Stripe keys:
   ```
   Go to Admin Monitor → Settings
   Look for "Stripe Keys"
   Verify they're not empty
   ```

2. Check Stripe dashboard:
   ```
   Go to https://dashboard.stripe.com
   Look for failed charges or webhook errors
   ```

3. Check if client's payment method is valid:
   ```
   Ask client: Did they enter a valid card?
   Did they use a test card?
   ```

**Solution:**

**If Stripe keys are missing:**
1. Go to Admin Monitor → Settings
2. Click "Add Stripe Keys"
3. Enter your Stripe Secret Key and Publishable Key
4. Save
5. Test checkout with test card: `4242 4242 4242 4242`

**If test card works but real cards don't:**
1. You're using sandbox keys
2. Go to Stripe dashboard
3. Switch from "Test Mode" to "Live Mode"
4. Get live keys
5. Update keys in Admin Monitor → Settings

**If specific customer's payment failed:**
1. Go to Stripe dashboard
2. Look for the failed charge
3. Check error message (usually card declined, expired, etc.)
4. Contact customer with error details
5. Ask them to update payment method

### Issue 7: Client Exceeded Agent/Website Limit

**Symptoms:** Client tries to create agent but gets "Limit exceeded" error

**Diagnosis:**

1. Check client's tier:
   ```
   Go to Admin Monitor → Clients
   Click on client
   Check "Subscription Tier"
   ```

2. Check current usage:
   ```
   Go to Admin Monitor → Clients
   Click on client
   Check "Agents" count and "Websites" count
   Compare to tier limits
   ```

**Tier Limits:**
- Starter: 1 agent, 1 website
- Growth: 5 agents, 3 websites
- Enterprise: Unlimited

**Solution:**

**Option 1: Upgrade Client to Higher Tier**
1. Go to Admin Monitor → Clients
2. Click on client
3. Click "Upgrade Tier"
4. Select new tier (Growth or Enterprise)
5. Send client invoice for upgrade
6. Client can now create more agents/websites

**Option 2: Delete Unused Agents/Websites**
1. Log into client's instance
2. Go to Agents or Websites
3. Delete agents/websites they're not using
4. This frees up slots for new ones

**Option 3: Discuss with Client**
1. Ask if they really need more agents/websites
2. Help them optimize existing ones instead
3. Suggest upgrade if they have genuine need

### Issue 8: Client's Data Disappeared

**Symptoms:** Client's agents, websites, or contacts are gone

**Diagnosis:**

1. Check if data was deleted:
   ```
   Go to Admin Monitor → Database
   Look for "Deleted Records"
   If recent deletion → Data was deleted
   ```

2. Check if database backup exists:
   ```
   Go to Admin Monitor → Backups
   Look for recent backup
   If backup exists → Can restore
   ```

**Solution:**

**If data was accidentally deleted:**
1. Go to Admin Monitor → Backups
2. Find the backup before deletion
3. Click "Restore from Backup"
4. Select the backup date
5. Wait 5-10 minutes for restore to complete
6. Data should be restored

**If no backup exists:**
1. Unfortunately, data cannot be recovered
2. Contact Manus support for emergency recovery options
3. Apologize to client and offer credit/discount
4. Set up automatic daily backups going forward

---

## Preventing Issues

### Set Up Automated Monitoring

1. Go to Admin Monitor → Settings
2. Enable "Automated Alerts"
3. Set alert thresholds:
   - Response time > 3 seconds
   - Error rate > 1%
   - Uptime < 99%
4. Set notification method (email, SMS, etc.)
5. You'll get notified immediately if issues occur

### Regular Maintenance

**Weekly:**
- Check all client instances are online
- Review system health metrics
- Check for any errors in logs

**Monthly:**
- Optimize databases
- Review and archive old data
- Update security patches
- Check backup status

**Quarterly:**
- Full system audit
- Performance review
- Capacity planning
- Security review

### Backup Strategy

1. Go to Admin Monitor → Backups
2. Set up automatic daily backups
3. Backups kept for 30 days
4. Test restore monthly to verify backups work
5. Keep offsite copy for disaster recovery

---

## Scaling Tips

### Managing 5-10 Clients

At this scale, manual management is fine:

- Check Admin Monitor daily
- Spend 1-2 hours/week on client support
- Use automation for routine tasks (invoice generation)
- Track everything in a spreadsheet

### Managing 20+ Clients

At this scale, you need more automation:

- Implement automated deployment
- Set up ticketing system for support
- Automate invoice generation and billing
- Use monitoring tools for alerts
- Hire support staff

### Key Metrics to Track

| Metric | Target |
|--------|--------|
| **Uptime** | 99.9% (less than 1 hour down/month) |
| **Response Time** | <2 seconds average |
| **Error Rate** | <0.1% |
| **Customer Satisfaction** | >4.5/5 |
| **Churn Rate** | <5% per month |
| **Revenue per Client** | $120-349/month |

---

## Client Communication

### First Contact

Send welcome email when client signs up:

```
Subject: Welcome to NexusCommand!

Hi [Client Name],

Welcome to NexusCommand! Your instance is now live at:
https://[client-domain].manus.space

Your login credentials:
Email: [email]
Password: [temporary password]

Next steps:
1. Log in and change your password
2. Build your first AI agent
3. Create your first website
4. Test the chatbot

Need help? Check out our guides or reply to this email.

Best regards,
[Your Name]
```

### Weekly Check-In

Send brief update email:

```
Subject: Weekly Update - [Client Name]

Hi [Client Name],

Here's your weekly summary:

Agents:
- Conversations: 150
- Satisfaction: 4.8/5
- Response time: 1.2s

Websites:
- Visitors: 2,340
- Page views: 5,120
- Bounce rate: 32%

Everything looks great! Let me know if you need anything.

Best regards,
[Your Name]
```

### Monthly Invoice

Send invoice and ask for feedback:

```
Subject: Invoice - [Client Name] - [Month]

Hi [Client Name],

Please find your invoice for [Month] attached.

Amount due: $[amount]
Due date: [date]

Quick question: How's everything going? Any feedback or features you'd like?

Best regards,
[Your Name]
```

---

## Support Ticket System (Optional)

As you grow, consider implementing a ticketing system:

1. **Email-based:** Forward support emails to a ticket system
2. **Web-based:** Clients submit tickets through a form
3. **Slack-based:** Integrate with Slack for real-time support

Track:
- Issue description
- Priority (urgent, high, medium, low)
- Status (open, in progress, resolved)
- Resolution time

---

## Troubleshooting Checklist

When a client reports an issue:

- [ ] Ask for detailed description of problem
- [ ] Ask when problem started
- [ ] Ask if it's affecting all users or just one
- [ ] Check Admin Monitor for alerts
- [ ] Check system health metrics
- [ ] Log into client's instance to reproduce issue
- [ ] Check error logs
- [ ] Try restarting service if needed
- [ ] Document issue and solution
- [ ] Follow up with client after fix
- [ ] Update documentation if it's a common issue

---

## Getting Help

If you can't solve an issue:

1. Check this guide first
2. Check the Complete User Guide
3. Check Manus documentation
4. Contact Manus support at https://help.manus.im
5. Post in community forums

---

## Next Steps

1. **Set up Admin Monitor** — Familiarize yourself with all sections
2. **Create test client** — Practice deploying and managing an instance
3. **Set up monitoring** — Enable automated alerts
4. **Create support process** — Decide how you'll handle client issues
5. **Get your first paying client** — Use the client onboarding checklist

**Good luck managing your clients! You've got this! 🚀**
