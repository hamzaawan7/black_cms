# Hyve CMS - Deployment Documentation

## 📋 Overview

This document covers deployment procedures for the Hyve CMS to Hostinger production server.

## 🌐 Production Server Details

| Property | Value |
|----------|-------|
| **Domain** | `palevioletred-snake-584520.hostingersite.com` |
| **Server IP** | `156.67.67.67` |
| **SSH Port** | `65002` |
| **SSH Username** | `u938549775` |
| **SSH Password** | `Timbuktu123@@@` |
| **Project Path** | `domains/palevioletred-snake-584520.hostingersite.com/public_html` |
| **Git Branch** | `main` |

---

## 🚀 Automatic Deployment (Recommended)

### GitHub Actions Auto-Deploy

When you push code to the `main` branch on GitHub, the deployment happens automatically:

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Build frontend assets
   - Deploy via FTP to Hostinger
   - Run `php artisan migrate --force`
   - Clear and optimize caches

3. **Check deployment status:**
   - Go to: https://github.com/hamzaawan7/black_cms/actions

### Required GitHub Secrets

Make sure these secrets are configured in GitHub repository settings:

| Secret Name | Value |
|-------------|-------|
| `FTP_PASSWORD` | SSH password for FTP deployment |
| `SSH_PASSWORD` | `Timbuktu123@@@` |

**To add secrets:**
1. Go to repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret

---

## 🛠️ Manual Deployment

### Option 1: Using Deployment Script

```bash
# Make the script executable (first time only)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### Option 2: SSH Commands

```bash
# Connect to server
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67

# Navigate to project
cd domains/palevioletred-snake-584520.hostingersite.com/public_html

# Pull latest code
git pull origin main

# Run migrations
php artisan migrate --force

# Optimize caches
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🌱 Running Seeders

### Using Seeder Script

```bash
# Make the script executable (first time only)
chmod +x scripts/seed.sh

# List available seeders
./scripts/seed.sh

# Run a specific seeder
./scripts/seed.sh MediaSeeder
./scripts/seed.sh MenuSeeder
./scripts/seed.sh MultiTenantSeeder
```

### Manual SSH Method

```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && php artisan db:seed --class=SeederName --force"
```

---

## 📝 Common Deployment Commands

### Clear All Caches
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && php artisan optimize:clear"
```

### View Laravel Logs
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && tail -100 storage/logs/laravel.log"
```

### Check Current Deployed Commit
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && git log -1 --oneline"
```

### Rollback Last Migration
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && php artisan migrate:rollback --force"
```

### Check Migration Status
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && php artisan migrate:status"
```

---

## 🔧 Troubleshooting

### sshpass Not Found (macOS)
```bash
brew install hudochenkov/sshpass/sshpass
```

### sshpass Not Found (Ubuntu/Linux)
```bash
sudo apt-get install sshpass
```

### Permission Denied Error
Make sure scripts are executable:
```bash
chmod +x scripts/deploy.sh
chmod +x scripts/seed.sh
```

### Git Conflicts on Production
If there are local changes on production:
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 \
  "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && git stash && git pull origin main"
```

### Check PHP Version
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 "php -v"
```

---

## 📁 Database Information

| Property | Value |
|----------|-------|
| **Host** | `localhost` |
| **Database** | `u938549775_hyvecms` |
| **Username** | `u938549775_hyvecms` |
| **Password** | `vC%&O^eCg3e9K5zx` |

---

## 🔄 Quick Reference - Copy & Paste Commands

### Deploy Latest Code
```bash
./scripts/deploy.sh
```

### SSH into Server
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67
```

### Full Manual Deploy
```bash
sshpass -p 'Timbuktu123@@@' ssh -p 65002 u938549775@156.67.67.67 "cd domains/palevioletred-snake-584520.hostingersite.com/public_html && git pull origin main && php artisan migrate --force && php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache"
```

---

## 📅 Deployment Checklist

- [ ] Commit all changes locally
- [ ] Push to `main` branch
- [ ] Check GitHub Actions for success
- [ ] Verify website is working: https://palevioletred-snake-584520.hostingersite.com
- [ ] Test CMS login: https://palevioletred-snake-584520.hostingersite.com/admin

---

*Last Updated: January 29, 2026*
