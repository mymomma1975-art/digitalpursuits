# NexusCommand - Deployment Guide

This guide covers deploying NexusCommand to your own infrastructure. The platform is fully self-contained and portable.

---

## Quick Start (Docker)

The fastest way to deploy anywhere:

```bash
# 1. Clone/copy the project to your server
# 2. Create your environment file
cp deploy/env-template.txt .env
# 3. Edit .env with your API keys
nano .env
# 4. Start everything
docker-compose up -d
```

Your app will be running at `http://your-server:3000`.

---

## Deployment Options

### Option 1: AWS Free Tier (EC2)

**Prerequisites:** AWS CLI configured, SSH key pair

```bash
# One-command deployment
chmod +x deploy/deploy-aws.sh
./deploy/deploy-aws.sh
```

This script will:
- Create an EC2 t2.micro instance (free tier eligible)
- Configure security groups (ports 22, 80, 443, 3000)
- Install Docker and Docker Compose
- Output SSH connection details

After the instance is ready:
```bash
# Upload your app
scp -i nexuscommand-key.pem -r ./* ubuntu@YOUR_IP:/opt/nexuscommand/

# SSH in and start
ssh -i nexuscommand-key.pem ubuntu@YOUR_IP
cd /opt/nexuscommand
cp deploy/env-template.txt .env
nano .env  # Add your API keys
docker-compose up -d
```

### Option 2: Any VPS (DigitalOcean, Linode, Vultr, Hetzner, etc.)

**Prerequisites:** A VPS with SSH access

```bash
# One-command deployment to your VPS
chmod +x deploy/deploy-vps.sh
./deploy/deploy-vps.sh YOUR_SERVER_IP
```

This script will:
- Install Docker and Docker Compose on the server
- Upload all application files
- Build and start the containers
- Output the access URL

### Option 3: Manual Docker Deployment

For any server with Docker installed:

```bash
# Build the app image
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

---

## Environment Configuration

Copy `deploy/env-template.txt` to `.env` and configure:

### Required Settings

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `JWT_SECRET` | Random string for session signing | Generate: `openssl rand -hex 32` |
| `DATABASE_URL` | MySQL connection string | Auto-configured with Docker |

### Banking & Payments (Add when ready)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `PLAID_CLIENT_ID` | Plaid API client ID | [dashboard.plaid.com](https://dashboard.plaid.com) |
| `PLAID_SECRET` | Plaid API secret | [dashboard.plaid.com](https://dashboard.plaid.com) |
| `MODERN_TREASURY_ORG_ID` | Modern Treasury org ID | [app.moderntreasury.com](https://app.moderntreasury.com) |
| `MODERN_TREASURY_API_KEY` | Modern Treasury API key | [app.moderntreasury.com](https://app.moderntreasury.com) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | [dashboard.stripe.com](https://dashboard.stripe.com) |
| `STRIPE_SECRET_KEY` | Stripe secret key | [dashboard.stripe.com](https://dashboard.stripe.com) |

### AI Integration

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | OpenAI API key (for self-hosted AI) | [platform.openai.com](https://platform.openai.com) |

---

## Adding SSL (HTTPS)

### With Let's Encrypt (Free)

1. Point your domain DNS to your server IP
2. Edit `nginx.conf` and replace `your-domain.com` with your actual domain
3. Start with SSL profile:
   ```bash
   docker-compose --profile with-ssl up -d
   ```
4. Install certbot and get certificate:
   ```bash
   docker exec nexuscommand-nginx sh -c "apk add certbot certbot-nginx && certbot --nginx -d your-domain.com"
   ```

---

## Selling Subscriptions to Clients

### Deploying Copies for Clients

Each client gets their own isolated instance:

```bash
# Deploy a copy for Client A
./deploy/deploy-vps.sh client-a-server-ip

# Deploy a copy for Client B  
./deploy/deploy-vps.sh client-b-server-ip
```

Each deployment is independent with its own database and configuration.

### Billing Clients

The platform includes a built-in billing tracker:
1. Go to **Billing** in the sidebar
2. Set monthly fees on agents and websites you build for clients
3. Track MRR (Monthly Recurring Revenue) and ARR (Annual Recurring Revenue)
4. Use the **Analytics** page to verify agent and website performance

---

## Database Management

### Backup

```bash
docker exec nexuscommand-db mysqldump -u nexus -pnexuspass nexuscommand > backup.sql
```

### Restore

```bash
docker exec -i nexuscommand-db mysql -u nexus -pnexuspass nexuscommand < backup.sql
```

---

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | Check logs: `docker-compose logs app` |
| Database connection error | Ensure DB is healthy: `docker-compose ps` |
| Port already in use | Change `APP_PORT` in `.env` |
| Out of memory | Upgrade to larger instance (t2.small for AWS) |
