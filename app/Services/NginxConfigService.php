<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class NginxConfigService
{
    protected string $configPath;
    protected string $sitesAvailablePath;
    protected string $sitesEnabledPath;

    public function __construct()
    {
        $this->configPath = config('app.nginx_config_path', '/etc/nginx/conf.d');
        $this->sitesAvailablePath = config('app.nginx_sites_available', '/etc/nginx/sites-available');
        $this->sitesEnabledPath = config('app.nginx_sites_enabled', '/etc/nginx/sites-enabled');
    }

    /**
     * Generate NGINX configuration for a domain
     */
    public function generateConfig(Tenant $tenant, string $domain, string $deploymentPath): array
    {
        try {
            $configContent = $this->buildConfigContent($tenant, $domain, $deploymentPath);
            $configFileName = $this->sanitizeDomain($domain) . '.conf';
            $configFilePath = "{$this->sitesAvailablePath}/{$configFileName}";

            // In development, just store the config content
            if (app()->environment('local', 'development')) {
                $storagePath = storage_path("nginx/{$configFileName}");
                File::ensureDirectoryExists(dirname($storagePath));
                File::put($storagePath, $configContent);

                Log::info("NGINX config generated (dev mode)", [
                    'domain' => $domain,
                    'config_path' => $storagePath,
                ]);

                return [
                    'success' => true,
                    'config_path' => $storagePath,
                    'config_content' => $configContent,
                    'mode' => 'development',
                ];
            }

            // In production, write to actual NGINX path
            File::put($configFilePath, $configContent);

            // Create symlink to sites-enabled
            $symlinkPath = "{$this->sitesEnabledPath}/{$configFileName}";
            if (!File::exists($symlinkPath)) {
                symlink($configFilePath, $symlinkPath);
            }

            // Test and reload NGINX
            $this->reloadNginx();

            Log::info("NGINX config generated and activated", [
                'domain' => $domain,
                'config_path' => $configFilePath,
            ]);

            return [
                'success' => true,
                'config_path' => $configFilePath,
                'symlink_path' => $symlinkPath,
                'mode' => 'production',
            ];

        } catch (\Exception $e) {
            Log::error("Failed to generate NGINX config", [
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Build the NGINX configuration content
     */
    protected function buildConfigContent(Tenant $tenant, string $domain, string $deploymentPath): string
    {
        $serverName = $domain;
        $rootPath = "{$deploymentPath}/out"; // Next.js static export output
        $apiUpstream = config('app.url', 'http://localhost:8000');

        return <<<NGINX
# NGINX Configuration for {$tenant->name}
# Domain: {$domain}
# Generated: {$this->now()}

server {
    listen 80;
    listen [::]:80;
    server_name {$serverName};

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name {$serverName};

    # SSL Configuration (managed by certbot/Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/{$serverName}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/{$serverName}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Root directory for static files
    root {$rootPath};
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Tenant identification header
    add_header X-Tenant-ID "{$tenant->id}" always;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|woff|woff2|ttf|eot|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    # Next.js static pages
    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
    }

    # API Proxy to Laravel CMS
    location /api/ {
        proxy_pass {$apiUpstream};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Tenant-Domain \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Logging
    access_log /var/log/nginx/{$this->sanitizeDomain($domain)}_access.log;
    error_log /var/log/nginx/{$this->sanitizeDomain($domain)}_error.log;
}
NGINX;
    }

    /**
     * Generate a simple HTTP-only config (for development or before SSL)
     */
    public function generateHttpOnlyConfig(Tenant $tenant, string $domain, string $deploymentPath): string
    {
        $serverName = $domain;
        $rootPath = "{$deploymentPath}/out";
        $apiUpstream = config('app.url', 'http://localhost:8000');

        return <<<NGINX
# NGINX Configuration for {$tenant->name} (HTTP Only)
# Domain: {$domain}
# Generated: {$this->now()}

server {
    listen 80;
    listen [::]:80;
    server_name {$serverName};

    root {$rootPath};
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # Tenant identification header
    add_header X-Tenant-ID "{$tenant->id}" always;

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|woff|woff2|ttf|eot|svg)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files \$uri =404;
    }

    # Next.js static pages
    location / {
        try_files \$uri \$uri.html \$uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass {$apiUpstream};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Tenant-Domain \$host;
    }

    # Health check
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Deny hidden files
    location ~ /\. {
        deny all;
    }

    access_log /var/log/nginx/{$this->sanitizeDomain($domain)}_access.log;
    error_log /var/log/nginx/{$this->sanitizeDomain($domain)}_error.log;
}
NGINX;
    }

    /**
     * Remove NGINX configuration for a domain
     */
    public function removeConfig(string $domain): bool
    {
        try {
            $configFileName = $this->sanitizeDomain($domain) . '.conf';

            if (app()->environment('local', 'development')) {
                $storagePath = storage_path("nginx/{$configFileName}");
                if (File::exists($storagePath)) {
                    File::delete($storagePath);
                }
                return true;
            }

            // Remove symlink
            $symlinkPath = "{$this->sitesEnabledPath}/{$configFileName}";
            if (File::exists($symlinkPath)) {
                File::delete($symlinkPath);
            }

            // Remove config file
            $configFilePath = "{$this->sitesAvailablePath}/{$configFileName}";
            if (File::exists($configFilePath)) {
                File::delete($configFilePath);
            }

            // Reload NGINX
            $this->reloadNginx();

            Log::info("NGINX config removed", ['domain' => $domain]);

            return true;

        } catch (\Exception $e) {
            Log::error("Failed to remove NGINX config", [
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Test NGINX configuration
     */
    public function testConfig(): array
    {
        $output = [];
        $returnCode = 0;

        exec('nginx -t 2>&1', $output, $returnCode);

        return [
            'valid' => $returnCode === 0,
            'output' => implode("\n", $output),
        ];
    }

    /**
     * Reload NGINX to apply configuration changes
     */
    public function reloadNginx(): bool
    {
        // Test config first
        $test = $this->testConfig();
        if (!$test['valid']) {
            Log::error("NGINX config test failed", ['output' => $test['output']]);
            throw new \Exception("NGINX configuration test failed: " . $test['output']);
        }

        // Reload NGINX
        $output = [];
        $returnCode = 0;
        exec('nginx -s reload 2>&1', $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("NGINX reload failed: " . implode("\n", $output));
        }

        Log::info("NGINX reloaded successfully");

        return true;
    }

    /**
     * Get all generated configs for a tenant
     */
    public function getTenantConfigs(Tenant $tenant): array
    {
        $configs = [];
        $domains = $tenant->getAllDomains();

        foreach ($domains as $domain) {
            $configFileName = $this->sanitizeDomain($domain) . '.conf';

            if (app()->environment('local', 'development')) {
                $path = storage_path("nginx/{$configFileName}");
            } else {
                $path = "{$this->sitesAvailablePath}/{$configFileName}";
            }

            $configs[$domain] = [
                'path' => $path,
                'exists' => File::exists($path),
                'content' => File::exists($path) ? File::get($path) : null,
            ];
        }

        return $configs;
    }

    /**
     * Sanitize domain for use in filenames
     */
    protected function sanitizeDomain(string $domain): string
    {
        return str_replace(['.', ':'], ['_', '_'], $domain);
    }

    /**
     * Get current timestamp
     */
    protected function now(): string
    {
        return now()->toISOString();
    }

    /**
     * Generate SSL certificate using Let's Encrypt
     */
    public function generateSslCertificate(string $domain, string $email): array
    {
        if (app()->environment('local', 'development')) {
            return [
                'success' => false,
                'message' => 'SSL generation not available in development mode',
            ];
        }

        try {
            $output = [];
            $returnCode = 0;

            // Use certbot to generate certificate
            $command = "certbot certonly --nginx -d {$domain} --non-interactive --agree-tos --email {$email} 2>&1";
            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                return [
                    'success' => false,
                    'message' => 'Failed to generate SSL certificate',
                    'output' => implode("\n", $output),
                ];
            }

            return [
                'success' => true,
                'message' => 'SSL certificate generated successfully',
                'output' => implode("\n", $output),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'SSL generation error: ' . $e->getMessage(),
            ];
        }
    }
}
