<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * SSL Certificate Service
 * 
 * Handles SSL certificate generation via Let's Encrypt/Certbot
 */
class SSLService
{
    /**
     * Generate SSL certificate for a domain using certbot
     */
    public function generateCertificate(Tenant $tenant): array
    {
        if (!$tenant->domain) {
            return [
                'success' => false,
                'message' => 'No domain configured for tenant',
            ];
        }

        $domain = preg_replace('#^https?://#', '', $tenant->domain);
        $domain = rtrim($domain, '/');
        $adminEmail = config('app.ssl.admin_email', 'admin@example.com');

        // Check if we're in development mode
        if (config('app.nginx.development_mode', true)) {
            Log::info("SSL generation skipped (dev mode)", [
                'tenant_id' => $tenant->id,
                'domain' => $domain,
            ]);

            return [
                'success' => true,
                'message' => 'SSL generation skipped in development mode',
                'mode' => 'development',
                'command' => $this->getCertbotCommand($domain, $adminEmail),
            ];
        }

        // Production: Run certbot
        try {
            $command = $this->getCertbotCommand($domain, $adminEmail);
            
            Log::info("Generating SSL certificate", [
                'tenant_id' => $tenant->id,
                'domain' => $domain,
                'command' => $command,
            ]);

            // Execute certbot command
            $result = Process::timeout(120)->run($command);

            if ($result->successful()) {
                $tenant->update([
                    'ssl_status' => 'active',
                    'ssl_issued_at' => now(),
                    'ssl_expires_at' => now()->addMonths(3), // Let's Encrypt certs valid for 90 days
                ]);

                Log::info("SSL certificate generated successfully", [
                    'tenant_id' => $tenant->id,
                    'domain' => $domain,
                ]);

                return [
                    'success' => true,
                    'message' => "SSL certificate generated for {$domain}",
                    'output' => $result->output(),
                ];
            }

            Log::error("SSL certificate generation failed", [
                'tenant_id' => $tenant->id,
                'domain' => $domain,
                'error' => $result->errorOutput(),
            ]);

            return [
                'success' => false,
                'message' => 'Certbot command failed',
                'error' => $result->errorOutput(),
            ];

        } catch (\Exception $e) {
            Log::error("SSL generation exception", [
                'tenant_id' => $tenant->id,
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Exception during SSL generation',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get the certbot command for a domain
     */
    protected function getCertbotCommand(string $domain, string $email): string
    {
        // Using --nginx plugin for automatic NGINX configuration
        // Using --non-interactive for automated execution
        // Using --agree-tos to automatically agree to terms
        // Using --redirect to force HTTPS redirect
        return "sudo certbot --nginx -d {$domain} -d www.{$domain} --non-interactive --agree-tos --email {$email} --redirect";
    }

    /**
     * Check if SSL certificate exists for a domain
     */
    public function checkCertificateExists(string $domain): bool
    {
        $certPath = "/etc/letsencrypt/live/{$domain}/fullchain.pem";
        return file_exists($certPath);
    }

    /**
     * Get certificate expiry date
     */
    public function getCertificateExpiry(string $domain): ?string
    {
        $certPath = "/etc/letsencrypt/live/{$domain}/fullchain.pem";
        
        if (!file_exists($certPath)) {
            return null;
        }

        try {
            $certData = openssl_x509_parse(file_get_contents($certPath));
            if ($certData && isset($certData['validTo_time_t'])) {
                return date('Y-m-d H:i:s', $certData['validTo_time_t']);
            }
        } catch (\Exception $e) {
            Log::error("Error reading certificate", ['domain' => $domain, 'error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Renew all certificates (called by cron)
     */
    public function renewAllCertificates(): array
    {
        if (config('app.nginx.development_mode', true)) {
            return [
                'success' => true,
                'message' => 'SSL renewal skipped in development mode',
            ];
        }

        try {
            $result = Process::timeout(300)->run('sudo certbot renew');

            Log::info("SSL renewal completed", [
                'output' => $result->output(),
            ]);

            return [
                'success' => $result->successful(),
                'message' => $result->successful() ? 'Renewal completed' : 'Renewal failed',
                'output' => $result->output(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Exception during renewal',
                'error' => $e->getMessage(),
            ];
        }
    }
}
