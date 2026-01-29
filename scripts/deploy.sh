#!/bin/bash
#===============================================================================
# Hyve CMS - Production Deployment Script
#===============================================================================
# This script deploys the latest code from GitHub to Hostinger production server
# Usage: ./scripts/deploy.sh
#===============================================================================

# Configuration
SSH_HOST="156.67.67.67"
SSH_PORT="65002"
SSH_USER="u938549775"
SSH_PASS="Timbuktu123@@@"
DOMAIN="palevioletred-snake-584520.hostingersite.com"
PROJECT_PATH="domains/${DOMAIN}/public_html"
GIT_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Installing sshpass...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    else
        sudo apt-get install -y sshpass
    fi
fi

# Function to run SSH commands
ssh_run() {
    sshpass -p "$SSH_PASS" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "cd $PROJECT_PATH && $1"
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Hyve CMS - Production Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}[1/4] Pulling latest code from GitHub...${NC}"
PULL_OUTPUT=$(ssh_run "git pull origin $GIT_BRANCH 2>&1")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Code pulled successfully${NC}"
    echo "$PULL_OUTPUT"
else
    echo -e "${RED}✗ Failed to pull code${NC}"
    echo "$PULL_OUTPUT"
    exit 1
fi
echo ""

# Step 2: Run migrations
echo -e "${YELLOW}[2/4] Running database migrations...${NC}"
MIGRATE_OUTPUT=$(ssh_run "php artisan migrate --force 2>&1")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
    echo "$MIGRATE_OUTPUT"
else
    echo -e "${RED}✗ Migration failed${NC}"
    echo "$MIGRATE_OUTPUT"
    exit 1
fi
echo ""

# Step 3: Clear and optimize cache
echo -e "${YELLOW}[3/4] Optimizing application...${NC}"
ssh_run "php artisan optimize:clear"
ssh_run "php artisan config:cache"
ssh_run "php artisan route:cache"
ssh_run "php artisan view:cache"
echo -e "${GREEN}✓ Cache optimized${NC}"
echo ""

# Step 4: Check deployment
echo -e "${YELLOW}[4/4] Verifying deployment...${NC}"
CURRENT_COMMIT=$(ssh_run "git rev-parse --short HEAD")
echo -e "${GREEN}✓ Deployed commit: ${CURRENT_COMMIT}${NC}"
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✓ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "URL: https://${DOMAIN}"
