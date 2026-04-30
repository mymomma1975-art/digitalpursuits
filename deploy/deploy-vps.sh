#!/bin/bash
# ============================================
# NexusCommand - VPS Deployment Script
# ============================================
# Works with any VPS: DigitalOcean, Linode, Vultr, Hetzner, etc.
#
# Usage:
#   ./deploy-vps.sh <server-ip> [ssh-key-path]
#
# Example:
#   ./deploy-vps.sh 123.45.67.89
#   ./deploy-vps.sh 123.45.67.89 ~/.ssh/my_key
# ============================================

set -e

SERVER_IP="${1}"
SSH_KEY="${2:-~/.ssh/id_rsa}"
SSH_USER="${SSH_USER:-root}"
APP_DIR="/opt/nexuscommand"

if [ -z "$SERVER_IP" ]; then
  echo "Usage: ./deploy-vps.sh <server-ip> [ssh-key-path]"
  echo ""
  echo "Examples:"
  echo "  ./deploy-vps.sh 123.45.67.89"
  echo "  ./deploy-vps.sh 123.45.67.89 ~/.ssh/my_key"
  exit 1
fi

echo "================================================"
echo "  NexusCommand - VPS Deployment"
echo "================================================"
echo "  Server: ${SSH_USER}@${SERVER_IP}"
echo "  App Dir: ${APP_DIR}"
echo "================================================"
echo ""

# Step 1: Install Docker on remote server
echo "[1/4] Installing Docker on remote server..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_IP}" << 'REMOTE_SETUP'
set -e
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
REMOTE_SETUP

# Step 2: Create app directory
echo "[2/4] Setting up app directory..."
ssh -i "$SSH_KEY" "${SSH_USER}@${SERVER_IP}" "mkdir -p ${APP_DIR}"

# Step 3: Upload files
echo "[3/4] Uploading application files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.manus-logs' \
  -e "ssh -i ${SSH_KEY}" \
  ./ "${SSH_USER}@${SERVER_IP}:${APP_DIR}/"

# Step 4: Start the app
echo "[4/4] Starting application..."
ssh -i "$SSH_KEY" "${SSH_USER}@${SERVER_IP}" << REMOTE_START
set -e
cd ${APP_DIR}

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp deploy/env-template.txt .env
  echo "Created .env from template. Please edit with your API keys!"
fi

# Build and start
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

# Check status
docker-compose ps
REMOTE_START

echo ""
echo "================================================"
echo "  DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "  Your app is running at: http://${SERVER_IP}:3000"
echo ""
echo "  To configure:"
echo "  1. SSH: ssh -i ${SSH_KEY} ${SSH_USER}@${SERVER_IP}"
echo "  2. Edit: nano ${APP_DIR}/.env"
echo "  3. Restart: cd ${APP_DIR} && docker-compose restart"
echo ""
echo "  To add SSL (free with Let's Encrypt):"
echo "  1. Point your domain to ${SERVER_IP}"
echo "  2. Edit nginx.conf with your domain"
echo "  3. Run: docker-compose --profile with-ssl up -d"
echo "  4. Run certbot inside the nginx container"
echo "================================================"
