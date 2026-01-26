#!/bin/bash
# =============================================================================
# VPS Setup Script for Multi-Tenant CMS
# Run this on a fresh Ubuntu/Debian VPS
# =============================================================================

set -e

echo "🚀 Starting VPS Setup for Multi-Tenant CMS..."

# Variables (update these)
DOMAIN="your-cms-domain.com"          # Your main CMS domain
DB_NAME="black_cms"
DB_USER="cms_user"
DB_PASS="secure_password_here"
APP_USER="www-data"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# =============================================================================
# Step 1: System Update
# =============================================================================
echo ""
echo "📦 Step 1: Updating System..."
apt update && apt upgrade -y
print_status "System updated"

# =============================================================================
# Step 2: Install Required Packages
# =============================================================================
echo ""
echo "📦 Step 2: Installing Required Packages..."

# Add PHP repository
apt install -y software-properties-common
add-apt-repository ppa:ondrej/php -y
apt update

# Install packages
apt install -y \
    nginx \
    mysql-server \
    php8.2-fpm \
    php8.2-cli \
    php8.2-common \
    php8.2-mysql \
    php8.2-xml \
    php8.2-xmlrpc \
    php8.2-curl \
    php8.2-gd \
    php8.2-imagick \
    php8.2-dev \
    php8.2-imap \
    php8.2-mbstring \
    php8.2-opcache \
    php8.2-soap \
    php8.2-zip \
    php8.2-intl \
    php8.2-bcmath \
    php8.2-redis \
    git \
    curl \
    unzip \
    certbot \
    python3-certbot-nginx \
    supervisor \
    redis-server

print_status "Packages installed"

# =============================================================================
# Step 3: Install Composer
# =============================================================================
echo ""
echo "📦 Step 3: Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
print_status "Composer installed"

# =============================================================================
# Step 4: Install Node.js
# =============================================================================
echo ""
echo "📦 Step 4: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_status "Node.js installed: $(node -v)"

# =============================================================================
# Step 5: Configure MySQL
# =============================================================================
echo ""
echo "📦 Step 5: Configuring MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
print_status "MySQL configured"

# =============================================================================
# Step 6: Create Directory Structure
# =============================================================================
echo ""
echo "📦 Step 6: Creating Directory Structure..."

# Main directories
mkdir -p /var/www/cms           # Laravel CMS
mkdir -p /var/www/frontend      # Next.js Frontend (shared by all tenants)
mkdir -p /var/www/templates     # Individual templates if needed
mkdir -p /var/log/nginx         # Nginx logs

# Set permissions
chown -R $APP_USER:$APP_USER /var/www
chmod -R 755 /var/www

print_status "Directories created"

# =============================================================================
# Step 7: Configure PHP-FPM
# =============================================================================
echo ""
echo "📦 Step 7: Configuring PHP-FPM..."

cat > /etc/php/8.2/fpm/pool.d/cms.conf << 'EOF'
[cms]
user = www-data
group = www-data
listen = /var/run/php/php8.2-cms.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35

php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
php_admin_value[max_execution_time] = 300
php_admin_value[memory_limit] = 256M
EOF

systemctl restart php8.2-fpm
print_status "PHP-FPM configured"

# =============================================================================
# Step 8: Configure Nginx (Main CMS)
# =============================================================================
echo ""
echo "📦 Step 8: Configuring Nginx..."

cat > /etc/nginx/sites-available/cms.conf << EOF
# Main CMS Backend (Laravel)
server {
    listen 80;
    server_name ${DOMAIN};
    
    root /var/www/cms/public;
    index index.php index.html;
    
    # Increase upload size
    client_max_body_size 100M;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-cms.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Default server for tenant domains (catch-all)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Shared frontend for all tenants
    root /var/www/frontend/out;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy to CMS
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Tenant-Domain \$host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/cms.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
print_status "Nginx configured"

# =============================================================================
# Step 9: Setup Supervisor for Laravel
# =============================================================================
echo ""
echo "📦 Step 9: Configuring Supervisor..."

cat > /etc/supervisor/conf.d/laravel-worker.conf << 'EOF'
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/cms/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/cms/storage/logs/worker.log
EOF

supervisorctl reread
supervisorctl update
print_status "Supervisor configured"

# =============================================================================
# Step 10: Create Sudoers for Nginx Reload (for Laravel to reload nginx)
# =============================================================================
echo ""
echo "📦 Step 10: Configuring Sudoers..."

cat > /etc/sudoers.d/www-data-nginx << 'EOF'
www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx -s reload
www-data ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
www-data ALL=(ALL) NOPASSWD: /usr/bin/certbot
EOF

chmod 440 /etc/sudoers.d/www-data-nginx
print_status "Sudoers configured"

# =============================================================================
# Step 11: Get Server IP
# =============================================================================
echo ""
SERVER_IP=$(curl -s ifconfig.me)
print_status "Server IP: $SERVER_IP"

# =============================================================================
# Done!
# =============================================================================
echo ""
echo "=============================================="
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Clone your CMS repository:"
echo "   cd /var/www/cms"
echo "   git clone https://github.com/your-repo/black_cms.git ."
echo "   composer install --no-dev --optimize-autoloader"
echo "   cp .env.example .env"
echo "   php artisan key:generate"
echo ""
echo "2. Update .env file with:"
echo "   DB_DATABASE=${DB_NAME}"
echo "   DB_USERNAME=${DB_USER}"
echo "   DB_PASSWORD=${DB_PASS}"
echo "   HOSTING_MODE=vps"
echo "   SERVER_IP=${SERVER_IP}"
echo ""
echo "3. Build frontend and copy to /var/www/frontend/out"
echo ""
echo "4. Run migrations:"
echo "   php artisan migrate --seed"
echo ""
echo "5. Generate SSL for CMS:"
echo "   certbot --nginx -d ${DOMAIN}"
echo ""
echo "📌 Important Info:"
echo "   Server IP: ${SERVER_IP}"
echo "   CMS URL: https://${DOMAIN}"
echo ""
echo "🔒 Client domains:"
echo "   - Add A Record: @ → ${SERVER_IP}"
echo "   - Nginx config auto-generated from CMS"
echo "   - SSL auto-generated when DNS verified"
echo ""
