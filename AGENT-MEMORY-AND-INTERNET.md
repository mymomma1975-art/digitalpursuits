# NexusCommand Agent Memory & Internet Access Guide

This guide explains how to leverage agent memory retention and internet access to build smarter, more capable AI agents that learn and adapt over time.

---

## Overview

Your AI agents in NexusCommand have two powerful capabilities:

1. **Memory Retention** — Agents remember previous conversations and learn from interactions
2. **Internet Access** — Agents can search the web for real-time information

Together, these features enable agents to provide increasingly accurate, personalized, and up-to-date responses.

---

## Agent Memory Retention

### What is Agent Memory?

Agent memory allows your AI chatbot to remember previous conversations with customers. Instead of treating each message as isolated, the agent builds context over time.

**Without Memory:**
- Customer: "I bought a laptop last week"
- Agent: "What can I help you with?"
- Customer: "It's not working"
- Agent: "What product are you asking about?" ← Agent forgot the laptop!

**With Memory:**
- Customer: "I bought a laptop last week"
- Agent: "Great! I've noted that you purchased a laptop. How can I help?"
- Customer: "It's not working"
- Agent: "I see your laptop isn't working. Let me help troubleshoot it." ← Agent remembers!

### How Memory Works in NexusCommand

**Conversation History:**
- Each conversation with a customer is stored in the database
- The agent can access the last 10-20 messages from previous conversations
- This context is automatically included when generating responses

**Learning from Interactions:**
- Every customer interaction is logged
- The agent learns patterns from these interactions
- Over time, responses become more accurate and personalized

**Customer Profiles:**
- The agent builds a profile of each customer over time
- Knows their preferences, purchase history, common issues
- Can proactively suggest solutions based on past interactions

### Setting Up Memory for Your Agent

**Step 1: Enable Memory in Agent Settings**

1. Go to **Agents** → Select your agent
2. Click **Settings** → **Memory & Learning**
3. Toggle **Enable Conversation Memory** to ON
4. Set **Memory Window**: 
   - **Short** (5 messages) — Good for simple Q&A
   - **Medium** (10 messages) — Recommended for most use cases
   - **Long** (20 messages) — For complex support scenarios

**Step 2: Configure Memory Retention**

- **Keep memories for**: 30 days (default), 90 days, or 1 year
- **Auto-summarize**: Enable to compress old conversations into summaries
- **Privacy**: Choose what data to retain (name, email, purchase history, etc.)

**Step 3: Train on Historical Data**

To make your agent smarter from day one:

1. Upload past customer conversations (CSV or JSON format)
2. Include common questions and ideal responses
3. The agent learns from these examples
4. New conversations build on this foundation

### Example: Training an Agent with Memory

**Scenario:** You're setting up a customer support agent for an e-commerce store.

**Step 1: Prepare Training Data**

Create a CSV with past conversations:

```csv
customer_name,question,response,category
John Smith,How do I track my order?,Go to Orders page and click Track,shipping
Sarah Lee,What's your return policy?,30-day returns no questions asked,returns
Mike Johnson,Is this item in stock?,Yes we have 5 in stock,inventory
```

**Step 2: Upload to Agent**

1. Go to **Agents** → Your agent → **Training Data**
2. Click **Upload CSV**
3. Select the file
4. Agent learns from these Q&A pairs

**Step 3: Enable Memory**

1. Go to **Settings** → **Memory & Learning**
2. Enable **Conversation Memory**
3. Set memory window to **Medium (10 messages)**

**Step 4: Test**

- Customer: "Hi, I'm John Smith and I ordered something last week"
- Agent: "Hi John! I see you're checking on your order. You can track it in your Orders page. What else can I help with?"
- Agent remembers John's previous interaction and provides relevant help!

### Memory Best Practices

**Do:**
- ✅ Enable memory for customer support agents (they benefit most)
- ✅ Train on real past conversations
- ✅ Regularly review agent responses (they improve over time)
- ✅ Update training data quarterly with new common questions
- ✅ Use memory to personalize responses ("Hi Sarah, good to hear from you again!")

**Don't:**
- ❌ Disable memory for customer-facing agents
- ❌ Store sensitive data (passwords, credit cards) in memory
- ❌ Rely only on memory without initial training data
- ❌ Forget to review what the agent is learning

---

## Agent Internet Access

### What is Internet Access?

Internet access allows your agent to search the web in real-time for current information. This is powerful for agents that need up-to-date data.

**Without Internet Access:**
- Customer: "What's the weather in New York?"
- Agent: "I don't have access to real-time weather data"

**With Internet Access:**
- Customer: "What's the weather in New York?"
- Agent: "It's currently 72°F and sunny in New York. Perfect day!" ← Agent searched the web!

### When to Enable Internet Access

**Enable for:**
- ✅ News and current events agents
- ✅ Weather information agents
- ✅ Stock price and financial agents
- ✅ Real estate and property agents
- ✅ Travel and tourism agents
- ✅ Product comparison agents
- ✅ Job search agents
- ✅ General knowledge agents

**Disable for:**
- ❌ Internal company knowledge bases (use training data instead)
- ❌ Sensitive business information (keep private)
- ❌ Customer data agents (privacy concerns)
- ❌ Agents where you control all information

### How Internet Access Works

**Search Process:**
1. Customer asks a question
2. Agent determines if it needs internet information
3. Agent searches the web for relevant results
4. Agent synthesizes information from multiple sources
5. Agent provides a comprehensive answer with sources

**Example Flow:**

```
Customer: "What are the top AI companies in 2026?"

Agent thinks: "This is current information, I need to search"

Agent searches: "top AI companies 2026"

Agent finds: OpenAI, Anthropic, Google DeepMind, etc.

Agent responds: "The top AI companies in 2026 include:
1. OpenAI - Known for ChatGPT and GPT-4
2. Anthropic - Creator of Claude AI
3. Google DeepMind - Advanced AI research
...and more. Here are the latest rankings..."
```

### Setting Up Internet Access for Your Agent

**Step 1: Enable Internet Access**

1. Go to **Agents** → Select your agent
2. Click **Settings** → **Internet & Web Search**
3. Toggle **Enable Internet Access** to ON
4. Choose search scope:
   - **Unrestricted** — Search entire web
   - **Domain-specific** — Search only specific websites
   - **Restricted** — Search only approved sources

**Step 2: Configure Search Behavior**

- **Auto-search threshold**: When to automatically search (confidence level)
- **Max search results**: How many sources to consider (3-10)
- **Search timeout**: How long to wait for results (5-30 seconds)
- **Source verification**: Require sources to be cited

**Step 3: Set Approved Sources (Optional)**

For domain-specific search:

1. Go to **Settings** → **Approved Sources**
2. Add domains:
   - `weather.gov` (weather)
   - `finance.yahoo.com` (stocks)
   - `wikipedia.org` (general knowledge)
3. Agent only searches these sources

**Step 4: Test**

- Ask your agent a question requiring current information
- Agent should search and provide up-to-date answer
- Verify sources are cited

### Example: Setting Up a Real Estate Agent with Internet Access

**Scenario:** You're building an agent to help customers find properties.

**Step 1: Enable Internet Access**

1. Go to **Agents** → Real Estate Agent → **Settings**
2. Enable **Internet Access**
3. Set search scope to **Domain-specific**

**Step 2: Add Approved Sources**

```
- zillow.com (property listings)
- redfin.com (property data)
- realtor.com (MLS listings)
- maps.google.com (location data)
- weather.gov (neighborhood weather)
```

**Step 3: Configure Search**

- Auto-search threshold: Medium (agent searches when uncertain)
- Max search results: 5
- Search timeout: 10 seconds

**Step 4: Test Conversation**

- Customer: "What properties are available in downtown Austin?"
- Agent searches Zillow and Redfin
- Agent: "I found 23 properties in downtown Austin. Here are the top 5..."
- Agent provides current listings with prices and details!

### Internet Access Best Practices

**Do:**
- ✅ Enable for agents that need current information
- ✅ Cite sources in responses ("According to weather.gov...")
- ✅ Restrict to trusted domains when possible
- ✅ Monitor search results for accuracy
- ✅ Test with real customer questions

**Don't:**
- ❌ Enable internet access for internal-only agents
- ❌ Search for sensitive information
- ❌ Trust unverified sources without review
- ❌ Leave search unrestricted without monitoring
- ❌ Forget to cite sources

---

## Combining Memory + Internet Access

The most powerful agents use **both** memory and internet access together.

### Example: Premium Customer Support Agent

**Configuration:**
- ✅ Memory enabled (Medium, 10 messages)
- ✅ Internet access enabled (domain-specific)
- ✅ Approved sources: Your company website, help docs, FAQ

**Conversation Flow:**

```
Customer: "Hi, I'm Sarah. I bought your Pro plan last month"

Agent remembers: Sarah's purchase history and preferences

Customer: "Does your Pro plan include API access?"

Agent thinks: "I know Sarah's history, but let me verify current features"

Agent searches: Your website for current Pro plan features

Agent responds: "Hi Sarah! Yes, your Pro plan includes API access. 
Since you've been with us for a month, here are some advanced 
features you might not know about..."

Agent provides personalized, current, and accurate information!
```

### When to Use Both

**Perfect for:**
- Customer support (remember customer, search knowledge base)
- Sales agents (remember prospect, search current pricing)
- Technical support (remember issue history, search latest docs)
- HR agents (remember employee info, search company policies)
- Product recommendation (remember preferences, search current inventory)

---

## Monitoring Agent Learning

### View Agent Performance

1. Go to **Analytics** → **Agent Performance**
2. See metrics:
   - **Conversation count** — How many conversations
   - **Resolution rate** — % of issues resolved
   - **Customer satisfaction** — Average rating
   - **Memory usage** — How much historical data stored
   - **Search frequency** — How often internet access used

### Improve Agent Over Time

**Weekly:**
- Review 5-10 recent conversations
- Check if agent is remembering correctly
- Verify internet search results are accurate
- Note any issues or gaps

**Monthly:**
- Analyze top questions asked
- Add new Q&A pairs to training data
- Update approved sources if needed
- Retrain agent with new information

**Quarterly:**
- Full performance review
- Compare metrics to previous quarter
- Gather customer feedback
- Plan improvements

### Example: Improving Your Agent

**Month 1 Metrics:**
- Conversations: 500
- Resolution rate: 72%
- Customer satisfaction: 3.8/5

**Issues Found:**
- Agent forgetting customer names (memory issue)
- Outdated product information (training data issue)
- Slow responses (timeout issue)

**Improvements Made:**
- Increased memory window from 5 to 10 messages
- Updated training data with latest products
- Increased search timeout from 5 to 10 seconds

**Month 2 Metrics:**
- Conversations: 520
- Resolution rate: 85% ← Improved!
- Customer satisfaction: 4.3/5 ← Improved!

---

## Troubleshooting Memory & Internet Issues

### Issue 1: Agent Not Remembering Customer

**Symptoms:** Agent asks "What's your name?" even though customer mentioned it earlier

**Solution:**
1. Check if memory is enabled (Settings → Memory & Learning)
2. Increase memory window (try Medium or Long)
3. Verify customer is in same conversation (not starting new chat)
4. Check database for conversation history

### Issue 2: Agent Providing Outdated Information

**Symptoms:** Agent gives old prices or outdated product info

**Solution:**
1. Enable internet access (Settings → Internet & Web Search)
2. Add approved sources for current information
3. Update training data with latest information
4. Increase search frequency (lower auto-search threshold)

### Issue 3: Agent Searches Taking Too Long

**Symptoms:** Agent responses delayed by 10+ seconds

**Solution:**
1. Reduce search timeout (Settings → Internet & Web Search)
2. Limit max search results (try 3-5 instead of 10)
3. Restrict to domain-specific search (faster than unrestricted)
4. Check internet connection speed

### Issue 4: Agent Forgetting Between Conversations

**Symptoms:** Agent remembers within one chat, but forgets in next day's chat

**Solution:**
1. This is normal — memory is per-conversation by design
2. To remember across conversations, use customer profiles
3. Enable customer data storage (Settings → Customer Profiles)
4. Agent will recognize returning customers

---

## Privacy & Security Considerations

### Data Retention

- **Conversation memory**: Stored for 30-90 days (configurable)
- **Customer profiles**: Stored indefinitely (unless deleted)
- **Search results**: Not stored (only used for immediate response)
- **Training data**: Stored permanently (your property)

### Privacy Best Practices

**Do:**
- ✅ Tell customers the agent has memory
- ✅ Allow customers to opt-out of memory
- ✅ Delete memory on customer request
- ✅ Comply with GDPR/CCPA regulations
- ✅ Encrypt sensitive data

**Don't:**
- ❌ Store passwords or credit cards in memory
- ❌ Share customer data with third parties
- ❌ Use memory for marketing without consent
- ❌ Retain data longer than necessary
- ❌ Forget to mention data collection in privacy policy

---

## Advanced: Custom Memory Strategies

### Strategy 1: Conversation Summarization

For long conversations, automatically summarize to keep memory efficient:

```
Full conversation: 50 messages
Summarized: "Customer bought Pro plan, wants API docs, 
needs billing help, satisfied with solution"

Agent uses summary instead of all 50 messages
Faster responses, same context
```

### Strategy 2: Customer Segmentation

Different memory strategies for different customer types:

- **VIP customers**: Keep 30 days of memory
- **Regular customers**: Keep 7 days of memory
- **New customers**: Keep 1 day of memory

### Strategy 3: Selective Memory

Remember only important information:

```
Remember: Purchase history, preferences, issues
Forget: Casual chat, greetings, timestamps

Keeps memory focused and efficient
```

---

## Getting Started Checklist

- [ ] Enable memory for your agent (Settings → Memory & Learning)
- [ ] Set memory window (recommend Medium for most agents)
- [ ] Upload training data (past conversations, Q&A pairs)
- [ ] Test memory (verify agent remembers across messages)
- [ ] Enable internet access if needed (Settings → Internet & Web Search)
- [ ] Add approved sources (if using domain-specific search)
- [ ] Test internet search (verify accuracy of results)
- [ ] Monitor agent performance (weekly reviews)
- [ ] Improve over time (update training data monthly)

---

## Next Steps

1. **Build your first agent** with memory enabled
2. **Train it on your data** (past conversations, FAQs)
3. **Enable internet access** if it needs current information
4. **Monitor and improve** based on customer feedback
5. **Scale to multiple agents** once you have the process down

---

## Support

For questions about agent memory or internet access:

1. Check the **Complete User Guide** in `/docs/guides/`
2. Review the **AI Copilot** (it has memory too!)
3. Contact support at hello@digitalpursuits.com

**Your agents are only as smart as the data you give them. Invest time in training, and they'll deliver amazing results!** 🚀
