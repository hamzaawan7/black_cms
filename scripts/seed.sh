#!/bin/bash
#===============================================================================
# Hyve CMS - Run Seeders on Production
#===============================================================================
# This script runs specific seeders on the Hostinger production server
# Usage: ./scripts/seed.sh [SeederName]
# Example: ./scripts/seed.sh MediaSeeder
#===============================================================================

# Configuration
SSH_HOST="156.67.67.67"
SSH_PORT="65002"
SSH_USER="u938549775"
SSH_PASS="Timbuktu123@@@"
DOMAIN="palevioletred-snake-584520.hostingersite.com"
PROJECT_PATH="domains/${DOMAIN}/public_html"

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
echo -e "${BLUE}   Hyve CMS - Production Seeder${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

if [ -z "$1" ]; then
    # List available seeders
    echo -e "${YELLOW}Available Seeders:${NC}"
    ssh_run "ls -1 database/seeders/*.php | xargs -n1 basename | sed 's/.php//'"
    echo ""
    echo -e "${YELLOW}Usage: ./scripts/seed.sh SeederName${NC}"
    echo -e "Example: ./scripts/seed.sh MediaSeeder"
else
    SEEDER_NAME=$1
    echo -e "${YELLOW}Running seeder: ${SEEDER_NAME}...${NC}"
    SEED_OUTPUT=$(ssh_run "php artisan db:seed --class=${SEEDER_NAME} --force 2>&1")
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✓ Seeder completed successfully${NC}"
        echo "$SEED_OUTPUT"
    else
        echo -e "${RED}✗ Seeder failed${NC}"
        echo "$SEED_OUTPUT"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}================================================${NC}"
