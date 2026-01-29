#!/bin/bash

# ============================================
# Local Multi-Tenant Testing Setup Script
# ============================================
# This script sets up:
# 1. Multiple local domains in /etc/hosts
# 2. Nginx configuration for reverse proxy
# 3. Creates test tenants in database
# ============================================

set -e

echo "🚀 Setting up Local Multi-Tenant Testing Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Define local test domains
TENANT1_CMS="tenant1.cms.local"
TENANT1_FRONTEND="tenant1.local"
TENANT2_CMS="tenant2.cms.local"
TENANT2_FRONTEND="tenant2.local"
MAIN_CMS="cms.local"
MAIN_FRONTEND="hyve.local"

# Check if running as root for /etc/hosts modification
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Some operations require sudo. You may be prompted for password.${NC}"
    fi
}

# Step 1: Add domains to /etc/hosts
setup_hosts() {
    echo -e "\n${GREEN}📝 Step 1: Setting up /etc/hosts...${NC}"
    
    # Check if entries already exist
    if grep -q "tenant1.local" /etc/hosts; then
        echo "Local tenant domains already configured in /etc/hosts"
    else
        echo "Adding local tenant domains to /etc/hosts..."
        sudo tee -a /etc/hosts > /dev/null << EOF

# Multi-Tenant Local Testing
127.0.0.1   ${MAIN_CMS}
127.0.0.1   ${MAIN_FRONTEND}
127.0.0.1   ${TENANT1_CMS}
127.0.0.1   ${TENANT1_FRONTEND}
127.0.0.1   ${TENANT2_CMS}
127.0.0.1   ${TENANT2_FRONTEND}
EOF
        echo -e "${GREEN}✅ Hosts file updated${NC}"
    fi
}

# Step 2: Create Nginx configuration
setup_nginx() {
    echo -e "\n${GREEN}📝 Step 2: Setting up Nginx configuration...${NC}"
    
    NGINX_CONF_DIR="/usr/local/etc/nginx"
    NGINX_SERVERS_DIR="${NGINX_CONF_DIR}/servers"
    
    # Create servers directory if it doesn't exist
    mkdir -p "${NGINX_SERVERS_DIR}"
    
    # Create main nginx.conf if needed
    if ! grep -q "include servers" "${NGINX_CONF_DIR}/nginx.conf" 2>/dev/null; then
        echo "Backing up original nginx.conf..."
        cp "${NGINX_CONF_DIR}/nginx.conf" "${NGINX_CONF_DIR}/nginx.conf.backup"
    fi
    
    # Create multi-tenant configuration
    cat > "${NGINX_SERVERS_DIR}/multitenant.conf" << 'EOF'
# Multi-Tenant Local Testing Configuration

# Upstream for Laravel CMS (PHP)
upstream cms_backend {
    server 127.0.0.1:8000;
}

# Upstream for Next.js Frontend
upstream frontend_backend {
    server 127.0.0.1:3000;
}

# ============================================
# Main Tenant (Hyve Wellness) - CMS
# ============================================
server {
    listen 80;
    server_name cms.local;
    
    location / {
        proxy_pass http://cms_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Main Tenant - Frontend
server {
    listen 80;
    server_name hyve.local;
    
    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for Next.js HMR
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# ============================================
# Tenant 1 (Demo Clinic) - CMS
# ============================================
server {
    listen 80;
    server_name tenant1.cms.local;
    
    location / {
        proxy_pass http://cms_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host tenant1.local;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Tenant 1 - Frontend
server {
    listen 80;
    server_name tenant1.local;
    
    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# ============================================
# Tenant 2 (Test Wellness) - CMS
# ============================================
server {
    listen 80;
    server_name tenant2.cms.local;
    
    location / {
        proxy_pass http://cms_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host tenant2.local;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Tenant 2 - Frontend
server {
    listen 80;
    server_name tenant2.local;
    
    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

    echo -e "${GREEN}✅ Nginx configuration created${NC}"
}

# Step 3: Update main nginx.conf to include servers
update_nginx_main() {
    echo -e "\n${GREEN}📝 Step 3: Updating main nginx.conf...${NC}"
    
    NGINX_CONF="/usr/local/etc/nginx/nginx.conf"
    
    # Check if include statement already exists
    if grep -q "include servers/\*\.conf" "${NGINX_CONF}"; then
        echo "Include statement already exists in nginx.conf"
    else
        # Add include before the closing brace of http block
        sed -i '' '/^http {/,/^}/{
            /^}/i\
    # Include server configurations\
    include servers/*.conf;
        }' "${NGINX_CONF}"
        echo -e "${GREEN}✅ nginx.conf updated${NC}"
    fi
}

# Step 4: Test nginx configuration
test_nginx() {
    echo -e "\n${GREEN}📝 Step 4: Testing Nginx configuration...${NC}"
    
    if nginx -t 2>&1; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    else
        echo -e "${RED}❌ Nginx configuration has errors${NC}"
        exit 1
    fi
}

# Step 5: Start/Restart nginx
restart_nginx() {
    echo -e "\n${GREEN}📝 Step 5: Starting Nginx...${NC}"
    
    # Stop if running
    brew services stop nginx 2>/dev/null || true
    
    # Start nginx
    brew services start nginx
    
    echo -e "${GREEN}✅ Nginx started${NC}"
}

# Print summary
print_summary() {
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}🎉 Local Multi-Tenant Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${YELLOW}Test URLs:${NC}"
    echo ""
    echo "Main Tenant (Hyve Wellness - ID: 1):"
    echo "  CMS:      http://cms.local"
    echo "  Frontend: http://hyve.local"
    echo ""
    echo "Tenant 1 (Demo Clinic - ID: 2):"
    echo "  CMS:      http://tenant1.cms.local"
    echo "  Frontend: http://tenant1.local"
    echo ""
    echo "Tenant 2 (Test Wellness - ID: 3):"
    echo "  CMS:      http://tenant2.cms.local"
    echo "  Frontend: http://tenant2.local"
    echo ""
    echo -e "${YELLOW}Make sure to:${NC}"
    echo "1. Run Laravel: cd black_cms && php artisan serve"
    echo "2. Run Next.js: cd black_hyverx && npm run dev"
    echo "3. Create test tenants using the seeder or CMS"
    echo ""
    echo -e "${YELLOW}To create test tenants, run:${NC}"
    echo "cd black_cms && php artisan db:seed --class=TestTenantsSeeder"
}

# Main execution
check_sudo
setup_hosts
setup_nginx
update_nginx_main
test_nginx
restart_nginx
print_summary
