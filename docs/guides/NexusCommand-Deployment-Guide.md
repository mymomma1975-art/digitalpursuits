# NexusCommand Deployment Guide

**Complete instructions for deploying your SaaS platform to AWS and connecting a custom domain.**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part A: Deploy to AWS (Free Tier)](#part-a-deploy-to-aws-free-tier)
3. [Part B: Connect a Custom Domain](#part-b-connect-a-custom-domain)
4. [Part C: Deploy Client Copies (VPS)](#part-c-deploy-client-copies-vps)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

Before you begin, make sure you have the following ready:

| Item | Purpose | Where to Get It |
|------|---------|-----------------|
| AWS Account | Host your main platform | [aws.amazon.com](https://aws.amazon.com) |
| GitHub Account | Already set up — your code is in `mymomma1975-art/digitalpursuits` on the `saas-platform` branch | [github.com](https://github.com) |
| Domain Name (optional) | Custom URL for your platform | Namecheap, Cloudflare, or GoDaddy |
| Stripe Account | Payment processing | [stripe.com](https://stripe.com) |
| Plaid Account (optional) | Bank connections | [plaid.com](https://plaid.com) |
| Modern Treasury Account (optional) | ACH/wire payments | [moderntreasury.com](https://moderntreasury.com) |

You do **not** need to be a programmer to follow this guide. Each step is written in plain language with the exact commands to copy and paste.

---

## Part A: Deploy to AWS (Free Tier)

AWS Free Tier gives you 12 months of a small server at no cost. This is enough to run NexusCommand for your personal business use.

### A1. Create Your AWS Account

Go to [aws.amazon.com](https://aws.amazon.com) and click **Create an AWS Account**. You will need a credit card on file, but you will not be charged as long as you stay within free tier limits (t2.micro instance, 30GB storage).

After signing up, log into the **AWS Management Console**.

### A2. Launch an EC2 Instance (Your Server)

An EC2 instance is simply a virtual computer in the cloud that runs your app 24/7.

1. In the AWS Console search bar, type **EC2** and click on it.
2. Click the orange **Launch Instance** button.
3. Configure your instance with these settings:

| Setting | Value |
|---------|-------|
| **Name** | NexusCommand |
| **Application and OS** | Ubuntu Server 22.04 LTS (free tier eligible) |
| **Architecture** | 64-bit (x86) |
| **Instance type** | t2.micro (free tier eligible) |
| **Key pair** | Click "Create new key pair" → name it `nexuscommand-key` → download the `.pem` file |
| **Network settings** | Check all three: Allow SSH (22), Allow HTTP (80), Allow HTTPS (443) |
| **Storage** | 20 GB (gp3) — free tier allows up to 30 GB |

4. Click **Launch Instance**.
5. Wait 1-2 minutes for the instance to start.
6. Go to **Instances** in the left sidebar, click on your instance, and copy the **Public IPv4 address** (it looks like `54.123.45.67`).

**Important:** Save the `.pem` key file somewhere safe. You need it every time you connect to your server. Never share it.

### A3. Connect to Your Server via SSH

Open a terminal on your computer (Terminal on Mac, PowerShell on Windows) and run:

```bash
# First, fix the key file permissions (required on Mac/Linux)
chmod 400 ~/Downloads/nexuscommand-key.pem

# Connect to your server (replace YOUR_IP with the IP you copied)
ssh -i ~/Downloads/nexuscommand-key.pem ubuntu@YOUR_IP
```

On Windows, if using PowerShell:
```powershell
ssh -i C:\Users\YourName\Downloads\nexuscommand-key.pem ubuntu@YOUR_IP
```

If it asks "Are you sure you want to continue connecting?" type `yes` and press Enter.

You are now logged into your server. You should see a prompt like `ubuntu@ip-172-31-xx-xx:~$`.

### A4. Install GitHub CLI and Authenticate

Since your repository is private, you need to authenticate with GitHub on the server:

```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli-stable.list > /dev/null
sudo apt update && sudo apt install gh -y

# Log in to GitHub
gh auth login
```

When prompted:
- Choose **GitHub.com**
- Choose **HTTPS**
- Choose **Login with a web browser**
- Copy the one-time code shown, open the URL on your phone/computer, and paste the code

### A5. Clone Your Code

```bash
# Clone the saas-platform branch
git clone -b saas-platform https://github.com/mymomma1975-art/digitalpursuits.git

# Enter the project folder
cd digitalpursuits
```

### A6. Configure Your Environment Variables

Copy the template and edit it with your real API keys:

```bash
cp deploy/env-template.txt .env
nano .env
```

Fill in each variable (see the [Environment Variables Reference](#environment-variables-reference) section below for details on where to find each value). When done editing:
- Press `Ctrl + X` to exit
- Press `Y` to save
- Press `Enter` to confirm

### A7. Run the Deployment Script

```bash
chmod +x deploy/deploy-aws.sh
./deploy/deploy-aws.sh
```

This script automatically:
- Installs Docker and Docker Compose
- Builds the application container
- Starts the MySQL database
- Starts the NexusCommand application
- Configures nginx as a reverse proxy

The process takes about 3-5 minutes. When it finishes, your platform is live.

### A8. Verify It's Working

Open your browser and go to:
```
http://YOUR_IP
```

You should see the NexusCommand sign-in page. If you do — congratulations, your platform is deployed!

---

## Part B: Connect a Custom Domain

A custom domain (like `nexuscommand.com` or `app.yourbusiness.com`) makes your platform look professional and is easier to remember than an IP address.

### B1. Purchase a Domain

If you don't already have a domain, purchase one from any registrar:

| Registrar | Typical Cost | Notes |
|-----------|-------------|-------|
| [Namecheap](https://namecheap.com) | $8-15/year | Easy DNS management |
| [Cloudflare](https://cloudflare.com/products/registrar) | $8-12/year | Free CDN + DDoS protection included |
| [GoDaddy](https://godaddy.com) | $12-20/year | Most well-known |
| [Google Domains](https://domains.google) | $12/year | Simple interface |

Choose something short and memorable. For example: `nexuscommand.com`, `yourbizname.com`, or use a subdomain of an existing domain like `app.yourdomain.com`.

### B2. Point Your Domain to Your Server

Log into your domain registrar's dashboard and find the **DNS Settings** or **DNS Management** page. Add the following records:

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| A | @ | Your server's IP address | 300 |
| A | www | Your server's IP address | 300 |

If you want to use a subdomain instead (like `app.yourdomain.com`):

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| A | app | Your server's IP address | 300 |

After saving, DNS changes take anywhere from 5 minutes to 1 hour to propagate worldwide. You can check propagation status at [dnschecker.org](https://dnschecker.org).

### B3. Configure Nginx for Your Domain

SSH back into your server and update the nginx configuration:

```bash
cd ~/digitalpursuits
sudo nano /etc/nginx/sites-available/default
```

Find the line that says `server_name _;` and replace it with your domain:
```
server_name yourdomain.com www.yourdomain.com;
```

Save the file (`Ctrl+X`, then `Y`, then `Enter`), then restart nginx:
```bash
sudo nginx -t          # Test the config (should say "ok")
sudo systemctl reload nginx
```

### B4. Install a Free SSL Certificate (HTTPS)

SSL encrypts traffic between your users and your server. It's free and takes 30 seconds:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get and install the certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

When prompted:
- Enter your email address (for renewal notifications)
- Agree to the terms of service
- Choose whether to redirect HTTP to HTTPS (choose **Yes** — recommended)

That's it. Your site is now live at `https://yourdomain.com` with a padlock icon in the browser.

### B5. Verify SSL Auto-Renewal

Certificates from Let's Encrypt expire every 90 days, but Certbot automatically renews them. Verify this is set up:

```bash
sudo certbot renew --dry-run
```

If it says "Congratulations, all simulated renewals succeeded" — you're all set. The certificate will renew itself automatically.

---

## Part C: Deploy Client Copies (VPS)

When you sell a subscription to a client, you deploy a separate copy of the platform for them. Each client gets their own isolated instance with their own database — completely independent from yours.

### C1. Choose a VPS Provider

For client deployments, use affordable VPS providers:

| Provider | Starting Price | Recommended Plan |
|----------|---------------|-----------------|
| [DigitalOcean](https://digitalocean.com) | $6/month | Basic Droplet, 1GB RAM |
| [Vultr](https://vultr.com) | $6/month | Cloud Compute, 1GB RAM |
| [Linode (Akamai)](https://linode.com) | $5/month | Nanode 1GB |
| [Hetzner](https://hetzner.com) | $4/month | CX22 (best value, EU-based) |

For each client, spin up one VPS. A $5-6/month server comfortably runs one NexusCommand instance.

### C2. Deploy to the Client's VPS

SSH into the new VPS, then:

```bash
# Install GitHub CLI and authenticate (same as Step A4)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli-stable.list > /dev/null
sudo apt update && sudo apt install gh -y
gh auth login

# Clone and deploy
git clone -b saas-platform https://github.com/mymomma1975-art/digitalpursuits.git
cd digitalpursuits
cp deploy/env-template.txt .env
nano .env    # Fill in client-specific API keys

chmod +x deploy/deploy-vps.sh
./deploy/deploy-vps.sh
```

### C3. Set Up Client's Domain/Subdomain

You have two options for client URLs:

**Option A — Subdomain of your domain** (e.g., `clientname.yourdomain.com`):
Add an A record in your DNS pointing to the client's VPS IP.

**Option B — Client's own domain** (e.g., `clientbusiness.com`):
Have the client add an A record pointing to their VPS IP, then run certbot on their server.

### C4. Client Billing Model

Your typical flow for each client:
1. Spin up a VPS ($5-10/month cost to you)
2. Deploy their instance
3. Charge them $50-200+/month via Stripe subscription
4. Monitor their usage via the Analytics dashboard
5. The platform's built-in billing module tracks everything

---

## Environment Variables Reference

Here is every variable you need to configure, where to find the value, and what it does:

### Required Variables

| Variable | What It Does | Where to Get It |
|----------|-------------|-----------------|
| `DATABASE_URL` | Connects to your MySQL database | Auto-generated by Docker Compose (use `mysql://root:yourpassword@db:3306/nexuscommand`) |
| `JWT_SECRET` | Signs authentication tokens | Generate with: `openssl rand -hex 32` |
| `NODE_ENV` | Tells the app it's in production | Set to `production` |
| `PORT` | Which port the app listens on | Set to `3000` (nginx handles 80/443) |

### Stripe (Payments)

| Variable | Where to Find It |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Developers → API Keys → Secret key |
| `STRIPE_PUBLISHABLE_KEY` | Same page → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → Add endpoint → use `https://yourdomain.com/api/stripe/webhook` → copy signing secret |

### Plaid (Banking — Optional)

| Variable | Where to Find It |
|----------|-----------------|
| `PLAID_CLIENT_ID` | [Plaid Dashboard](https://dashboard.plaid.com/team/keys) → Team Settings → Keys |
| `PLAID_SECRET` | Same page → Sandbox secret (use Sandbox first, switch to Production later) |
| `PLAID_ENV` | Set to `sandbox` for testing, `production` when ready |

### Modern Treasury (ACH/Wire — Optional)

| Variable | Where to Find It |
|----------|-----------------|
| `MODERN_TREASURY_API_KEY` | [Modern Treasury Dashboard](https://app.moderntreasury.com) → Settings → API Keys |
| `MODERN_TREASURY_ORG_ID` | Same page → Organization ID |

### Generating a Secure JWT Secret

Run this command on your server (or any terminal):
```bash
openssl rand -hex 32
```

It outputs something like: `a3f8b2c1d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef`

Copy that entire string and paste it as your `JWT_SECRET` value.

---

## Troubleshooting

### "Connection refused" when visiting your IP

The app might still be starting up. Check its status:
```bash
cd ~/digitalpursuits
docker compose ps        # Shows if containers are running
docker compose logs -f   # Shows live logs (Ctrl+C to exit)
```

If containers aren't running:
```bash
docker compose up -d     # Start them
```

### "502 Bad Gateway" error

This means nginx is running but can't reach the app. The app container may have crashed:
```bash
docker compose logs app | tail -50    # Check for errors
docker compose restart app            # Restart the app
```

### Can't connect via SSH

If your connection times out, check that port 22 is open in your AWS Security Group:
1. Go to EC2 → Security Groups → select your instance's group
2. Click "Edit inbound rules"
3. Ensure there's a rule: Type=SSH, Port=22, Source=0.0.0.0/0

### Domain not resolving

DNS changes can take up to 1 hour. Check propagation at [dnschecker.org](https://dnschecker.org). Make sure:
- The A record points to the correct IP
- There's no conflicting CNAME record
- You saved the DNS changes in your registrar

### SSL certificate errors

If certbot fails, make sure:
- Your domain's DNS is already pointing to your server (certbot verifies this)
- Ports 80 and 443 are open
- Nginx is running: `sudo systemctl status nginx`

---

## Maintenance & Updates

### Updating Your Platform

When you make changes to the code and push to GitHub:

```bash
# SSH into your server
cd ~/digitalpursuits

# Pull the latest code
git pull origin saas-platform

# Rebuild and restart
docker compose down
docker compose up -d --build
```

### Backing Up Your Database

Set up a daily backup with a simple cron job:

```bash
# Create a backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec nexuscommand-db mysqldump -u root -pyourpassword nexuscommand > ~/backups/backup_$TIMESTAMP.sql
# Keep only last 7 days of backups
find ~/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x ~/backup-db.sh
mkdir -p ~/backups

# Run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup-db.sh") | crontab -
```

### Monitoring Server Health

Check if everything is running:
```bash
docker compose ps                    # Container status
df -h                                # Disk space
free -m                              # Memory usage
docker compose logs --tail=20 app    # Recent app logs
```

### Restarting After a Server Reboot

If your EC2 instance restarts (rare, but happens during AWS maintenance):
```bash
cd ~/digitalpursuits
docker compose up -d
```

To make it start automatically on boot:
```bash
sudo systemctl enable docker
```

---

## Cost Summary

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| AWS EC2 (your main instance) | $0 for 12 months | Free tier t2.micro |
| AWS EC2 (after free tier) | ~$8-10/month | Or switch to a cheaper VPS |
| Domain name | ~$1/month | ($10-15/year) |
| SSL certificate | $0 | Let's Encrypt is free forever |
| Per-client VPS | $5-10/month each | Your cost; charge clients $50-200+ |
| Stripe fees | 2.9% + $0.30 per transaction | Standard processing fee |

**Your profit model:** You pay $5-10/month per client VPS, charge them $50-200+/month for the platform subscription. That's a 5-40x markup on infrastructure costs alone, plus the value of the AI agents and websites you build for them.

---

## Quick Command Reference

Here are the most common commands you'll use, all in one place:

```bash
# Connect to your server
ssh -i ~/Downloads/nexuscommand-key.pem ubuntu@YOUR_IP

# Check if app is running
docker compose ps

# View live logs
docker compose logs -f

# Restart the app
docker compose restart app

# Full rebuild after code update
git pull origin saas-platform && docker compose up -d --build

# Check disk space
df -h

# Check memory
free -m

# Renew SSL (usually automatic)
sudo certbot renew
```

---

*This guide was prepared for the NexusCommand SaaS Platform. Your code lives at `github.com/mymomma1975-art/digitalpursuits` on the `saas-platform` branch. For questions or issues, refer to the DEPLOY.md file included in the repository.*
