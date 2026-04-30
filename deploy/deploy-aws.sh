#!/bin/bash
# ============================================
# NexusCommand - AWS EC2 Deployment Script
# ============================================
# Prerequisites:
#   - AWS CLI configured (aws configure)
#   - SSH key pair created in AWS
#   - This script creates an EC2 instance on Free Tier
# ============================================

set -e

# Configuration
INSTANCE_TYPE="${INSTANCE_TYPE:-t2.micro}"
AMI_ID="${AMI_ID:-ami-0c7217cdde317cfec}"  # Ubuntu 22.04 us-east-1
KEY_NAME="${KEY_NAME:-nexuscommand-key}"
SECURITY_GROUP="${SECURITY_GROUP:-nexuscommand-sg}"
REGION="${AWS_REGION:-us-east-1}"

echo "================================================"
echo "  NexusCommand - AWS Deployment"
echo "================================================"
echo ""

# Step 1: Create security group
echo "[1/5] Creating security group..."
SG_ID=$(aws ec2 create-security-group \
  --group-name "$SECURITY_GROUP" \
  --description "NexusCommand SaaS Platform" \
  --region "$REGION" \
  --output text --query 'GroupId' 2>/dev/null || \
  aws ec2 describe-security-groups \
    --group-names "$SECURITY_GROUP" \
    --region "$REGION" \
    --output text --query 'SecurityGroups[0].GroupId')

echo "  Security Group: $SG_ID"

# Allow HTTP, HTTPS, SSH
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0 --region "$REGION" 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr 0.0.0.0/0 --region "$REGION" 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0 --region "$REGION" 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region "$REGION" 2>/dev/null || true

# Step 2: Create key pair if not exists
echo "[2/5] Setting up SSH key..."
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" --region "$REGION" &>/dev/null; then
  aws ec2 create-key-pair --key-name "$KEY_NAME" --region "$REGION" --query 'KeyMaterial' --output text > "${KEY_NAME}.pem"
  chmod 400 "${KEY_NAME}.pem"
  echo "  Key saved to ${KEY_NAME}.pem"
else
  echo "  Key pair already exists"
fi

# Step 3: Create user data script
echo "[3/5] Preparing instance setup..."
USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
set -e

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/nexuscommand
chown ubuntu:ubuntu /opt/nexuscommand

echo "Setup complete! Upload your app files to /opt/nexuscommand"
USERDATA
)

# Step 4: Launch instance
echo "[4/5] Launching EC2 instance (${INSTANCE_TYPE})..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --user-data "$USER_DATA" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=NexusCommand}]" \
  --region "$REGION" \
  --output text --query 'Instances[0].InstanceId')

echo "  Instance ID: $INSTANCE_ID"
echo "  Waiting for instance to start..."

aws ec2 wait instance-running --instance-ids "$INSTANCE_ID" --region "$REGION"

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --output text --query 'Reservations[0].Instances[0].PublicIpAddress')

echo ""
echo "[5/5] Instance is running!"
echo ""
echo "================================================"
echo "  DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "  Instance IP: $PUBLIC_IP"
echo "  SSH Command: ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}"
echo ""
echo "  Next steps:"
echo "  1. Wait 2-3 minutes for Docker to install"
echo "  2. Upload your app:"
echo "     scp -i ${KEY_NAME}.pem -r ./* ubuntu@${PUBLIC_IP}:/opt/nexuscommand/"
echo "  3. SSH into the server:"
echo "     ssh -i ${KEY_NAME}.pem ubuntu@${PUBLIC_IP}"
echo "  4. Start the app:"
echo "     cd /opt/nexuscommand && cp deploy/env-template.txt .env"
echo "     # Edit .env with your API keys"
echo "     docker-compose up -d"
echo ""
echo "  Your app will be available at: http://${PUBLIC_IP}:3000"
echo "================================================"
