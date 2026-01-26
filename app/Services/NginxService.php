<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Log;

class NginxService
{
    /**
     * Base paths for VPS setup
     */
    protected string $nginxSitesAvailable = '/etc/nginx/sites-available';
    protected string $nginxSitesEnabled = '/etc/nginx/sites-enabled';
    protected string $templatesPath = '/var/www/templates';
    protected string $frontendPath = '/var/www/frontend';
    
    /**
     * Create Nginx config file for a tenant
     */
    public function createConfig(Tenant $tenant): array
    {
        if (!$tenant->domain) {
            return ['success' => false, 'message' => 'No domain configured for tenant'];
        }

        try {
            $domain = $this->cleanDomain($tenant->domain);
            $configFile = "{$this->nginxSitesAvailable}/{$domain}.conf";
            
            // Get template path (if tenant has specific template, use it)
            $templateFolder = $tenant->activeTemplate?->folder ?? 'default';
            $rootPath = "{$this->templatesPath}/{$templateFolder}/public";
            
            // If no specific template, use main frontend
            if (!is_dir($rootPath)) {
                $rootPath = "{$this->frontendPath}/public";
            }
            
            // Generate nginx config
            $config = $this->generateNginxConfig($domain, $rootPath);
            
            // Write config file
            if (!file_put_contents($configFile, $config)) {
                throw new \Exception("Failed to write nginx config file");
            }
            
            // Create symlink to enable site
            $enabledLink = "{$this->nginxSitesEnabled}/{$domain}.conf";
            if (!file_exists($enabledLink)) {
                symlink($configFile, $enabledLink);
            }
            
            // Test nginx config
            $testResult = $this->testNginxConfig();
            if (!$testResult['success']) {
                // Remove bad config
                unlink($configFile);
                if (file_exists($enabledLink)) {
                    unlink($enabledLink);
                }
                throw new \Exception("Nginx config test failed: " . $testResult['message']);
            }
            
            // Reload nginx
            $this->reloadNginx();
            
            // Update tenant record
            $tenant->update([
                'nginx_config_file' => "{$domain}.conf",
                'nginx_status' => 'active',
            ]);
            
            Log::info("Nginx config created for tenant {$tenant->id}: {$domain}");
            
            return [
                'success' => true,
                'message' => 'Nginx config created successfully',
                'config_file' => $configFile,
                'domain' => $domain,
            ];
            
        } catch (\Exception $e) {
            Log::error("Failed to create nginx config for tenant {$tenant->id}: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Generate SSL certificate using Let's Encrypt
     */
    public function generateSSL(Tenant $tenant): array
    {
        if (!$tenant->domain) {
            return ['success' => false, 'message' => 'No domain configured'];
        }
        
        try {
            $domain = $this->cleanDomain($tenant->domain);
            
            // Run certbot
            $command = "sudo certbot --nginx -d {$domain} -d www.{$domain} --non-interactive --agree-tos --email admin@{$domain} 2>&1";
            $output = shell_exec($command);
            
            if (strpos($output, 'Successfully') !== false || strpos($output, 'Congratulations') !== false) {
                $tenant->update(['ssl_status' => 'active']);
                
                Log::info("SSL certificate generated for {$domain}");
                
                return [
                    'success' => true,
                    'message' => 'SSL certificate generated successfully',
                ];
            }
            
            // Try without www if failed
            $command = "sudo certbot --nginx -d {$domain} --non-interactive --agree-tos --email admin@{$domain} 2>&1";
            $output = shell_exec($command);
            
            if (strpos($output, 'Successfully') !== false || strpos($output, 'Congratulations') !== false) {
                $tenant->update(['ssl_status' => 'active']);
                return ['success' => true, 'message' => 'SSL certificate generated (without www)'];
            }
            
            throw new \Exception("Certbot failed: " . $output);
            
        } catch (\Exception $e) {
            Log::error("SSL generation failed for tenant {$tenant->id}: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
    
    /**
     * Delete Nginx config for a tenant
     */
    public function deleteConfig(Tenant $tenant): array
    {
        try {
            $domain = $this->cleanDomain($tenant->domain);
            $configFile = "{$this->nginxSitesAvailable}/{$domain}.conf";
            $enabledLink = "{$this->nginxSitesEnabled}/{$domain}.conf";
            
            // Remove symlink
            if (file_exists($enabledLink)) {
                unlink($enabledLink);
            }
            
            // Remove config file
            if (file_exists($configFile)) {
                unlink($configFile);
            }
            
            // Reload nginx
            $this->reloadNginx();
            
            $tenant->update([
                'nginx_config_file' => null,
                'nginx_status' => 'deleted',
            ]);
            
            Log::info("Nginx config deleted for tenant {$tenant->id}");
            
            return ['success' => true, 'message' => 'Nginx config deleted'];
            
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Update Nginx config when template changes
     */
    public function updateConfig(Tenant $tenant): array
    {
        // Delete old config and create new one
        $this->deleteConfig($tenant);
        return $this->createConfig($tenant);
    }
    
    /**
     * Generate nginx config content
     */
    protected function generateNginxConfig(string $domain, string $rootPath): string
    {
        $apiUrl = config('app.api_url', 'http://localhost:8000');
        
        return <<<NGINX
# Nginx config for {$domain}
# Auto-generated by CMS - Do not edit manually

server {
    listen 80;
    listen [::]:80;
    server_name {$domain} www.{$domain};
    
    # Root directory (template files)
    root {$rootPath};
    index index.html index.htm;
    
    # Logs
    access_log /var/log/nginx/{$domain}.access.log;
    error_log /var/log/nginx/{$domain}.error.log;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend routes (SPA support)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy - forward to Laravel backend
    location /api {
        proxy_pass {$apiUrl};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Tenant-Domain \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # Health check
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

NGINX;
    }
    
    /**
     * Test nginx configuration
     */
    protected function testNginxConfig(): array
    {
        $output = shell_exec('sudo nginx -t 2>&1');
        
        if (strpos($output, 'successful') !== false) {
            return ['success' => true, 'message' => 'Config is valid'];
        }
        
        return ['success' => false, 'message' => $output];
    }
    
    /**
     * Reload nginx
     */
    protected function reloadNginx(): bool
    {
        $output = shell_exec('sudo nginx -s reload 2>&1');
        return true;
    }
    
    /**
     * Clean domain (remove http/https, trailing slashes)
     */
    protected function cleanDomain(string $domain): string
    {
        $domain = preg_replace('#^https?://#', '', $domain);
        $domain = rtrim($domain, '/');
        $domain = strtolower($domain);
        return $domain;
    }
    
    /**
     * Check if domain is pointing to this server
     */
    public function checkDomainDNS(string $domain): array
    {
        $domain = $this->cleanDomain($domain);
        $serverIP = shell_exec('curl -s ifconfig.me');
        $serverIP = trim($serverIP);
        
        $domainIP = gethostbyname($domain);
        
        if ($domainIP === $domain) {
            return [
                'success' => false,
                'message' => 'Domain DNS not configured',
                'server_ip' => $serverIP,
                'domain_ip' => null,
            ];
        }
        
        $isPointing = ($domainIP === $serverIP);
        
        return [
            'success' => $isPointing,
            'message' => $isPointing ? 'Domain is pointing to this server' : 'Domain is pointing elsewhere',
            'server_ip' => $serverIP,
            'domain_ip' => $domainIP,
        ];
    }
}
