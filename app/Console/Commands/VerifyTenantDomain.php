<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantService;
use App\Services\SSLService;
use Illuminate\Console\Command;

class VerifyTenantDomain extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant:verify 
                            {tenant_id? : The ID of the tenant to verify}
                            {--all : Verify all tenants with domains}
                            {--pending : Only verify tenants with pending DNS status}
                            {--auto-ssl : Automatically generate SSL for verified domains}';

    /**
     * The console command description.
     */
    protected $description = 'Verify DNS setup for tenant domains and optionally generate SSL certificates';

    protected TenantService $tenantService;
    protected SSLService $sslService;

    public function __construct(TenantService $tenantService, SSLService $sslService)
    {
        parent::__construct();
        $this->tenantService = $tenantService;
        $this->sslService = $sslService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('===========================================');
        $this->info('  VPS/NGINX Tenant Domain Verification');
        $this->info('===========================================');
        $this->newLine();

        $vpsIP = config('app.server_ip');
        $devMode = config('app.nginx.development_mode', true);
        
        $this->info("VPS IP: " . ($vpsIP ?: 'NOT SET - configure VPS_SERVER_IP in .env'));
        $this->info("Mode: " . ($devMode ? 'Development' : 'Production'));
        $this->newLine();

        if ($this->option('all')) {
            return $this->verifyAll();
        }

        if ($this->option('pending')) {
            return $this->verifyPending();
        }

        $tenantId = $this->argument('tenant_id');
        
        if (!$tenantId) {
            $this->error('Please provide a tenant ID, use --all, or use --pending');
            $this->newLine();
            $this->line('Examples:');
            $this->line('  php artisan tenant:verify 5           # Verify specific tenant');
            $this->line('  php artisan tenant:verify --all       # Verify all tenants');
            $this->line('  php artisan tenant:verify --pending   # Verify only pending');
            return 1;
        }

        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            $this->error("Tenant (ID: {$tenantId}) not found!");
            return 1;
        }

        if (empty($tenant->domain)) {
            $this->error("Tenant '{$tenant->name}' does not have a domain set!");
            return 1;
        }

        return $this->verifyTenant($tenant);
    }

    /**
     * Verify all tenants with domains.
     */
    protected function verifyAll(): int
    {
        $tenants = Tenant::whereNotNull('domain')
            ->where('domain', '!=', '')
            ->where('is_active', true)
            ->get();

        if ($tenants->isEmpty()) {
            $this->warn('No active tenants with domains found.');
            return 0;
        }

        $this->info("Found {$tenants->count()} tenant(s) with domains.");
        $this->newLine();

        return $this->verifyMultiple($tenants);
    }

    /**
     * Verify tenants with pending DNS status.
     */
    protected function verifyPending(): int
    {
        $tenants = Tenant::whereNotNull('domain')
            ->where('domain', '!=', '')
            ->where('is_active', true)
            ->where('deployment_status', 'pending_dns')
            ->get();

        if ($tenants->isEmpty()) {
            $this->info('No tenants with pending DNS verification found.');
            return 0;
        }

        $this->info("Found {$tenants->count()} tenant(s) with pending DNS.");
        $this->newLine();

        return $this->verifyMultiple($tenants);
    }

    /**
     * Verify multiple tenants.
     */
    protected function verifyMultiple($tenants): int
    {
        $successCount = 0;
        $pendingCount = 0;
        $failCount = 0;

        foreach ($tenants as $tenant) {
            $result = $this->verifyTenant($tenant);
            if ($result === 0) {
                $successCount++;
            } elseif ($result === 2) {
                $pendingCount++;
            } else {
                $failCount++;
            }
            $this->newLine();
        }

        $this->newLine();
        $this->info("===========================================");
        $this->info("Summary:");
        $this->info("  ✓ Active: {$successCount}");
        $this->info("  ⏳ Pending: {$pendingCount}");
        $this->info("  ✗ Failed: {$failCount}");
        $this->info("===========================================");

        return $failCount > 0 ? 1 : 0;
    }

    /**
     * Verify a specific tenant's domain.
     */
    protected function verifyTenant(Tenant $tenant): int
    {
        $this->info("Verifying: {$tenant->name}");
        $this->line("  Domain: {$tenant->domain}");
        $this->line("  Current Status: " . ($tenant->deployment_status ?? 'none'));

        $result = $this->tenantService->verifyDomainSetup($tenant);

        if ($result['success']) {
            $this->info("  ✓ Domain is LIVE with SSL!");
            $this->line("  URL: {$result['url']}");
            return 0;
        }

        // Handle different statuses
        $status = $result['status'] ?? 'unknown';

        switch ($status) {
            case 'pending_ssl':
                $this->warn("  ⚡ DNS Verified! SSL certificate needed.");
                
                // Auto-generate SSL if flag is set
                if ($this->option('auto-ssl')) {
                    $this->line("  → Generating SSL certificate...");
                    $sslResult = $this->sslService->generateCertificate($tenant);
                    
                    if ($sslResult['success']) {
                        $this->info("  ✓ SSL certificate generated!");
                        return 0;
                    } else {
                        $this->error("  ✗ SSL generation failed: " . ($sslResult['message'] ?? 'Unknown error'));
                        if (isset($sslResult['command'])) {
                            $this->line("  Manual command: " . $sslResult['command']);
                        }
                    }
                } else {
                    $this->line("  Run with --auto-ssl to generate certificate automatically");
                    if (isset($result['ssl_command'])) {
                        $this->line("  Or manually: " . $result['ssl_command']);
                    }
                }
                return 2;

            case 'dns_propagating':
                $this->warn("  ⏳ DNS verified but not reachable yet. Wait or check NGINX.");
                if (isset($result['nginx_check'])) {
                    $this->line("  Check NGINX: " . $result['nginx_check']);
                }
                return 2;

            case 'dns_wrong_ip':
                $this->error("  ✗ DNS pointing to wrong IP");
                $this->line("  Current: " . ($result['dns_info']['resolved_ip'] ?? 'unknown'));
                $this->line("  Expected: " . ($result['dns_info']['expected_ip'] ?? 'unknown'));
                $this->showInstructions($result);
                return 1;

            case 'dns_not_configured':
                $this->error("  ✗ DNS not configured");
                $this->showInstructions($result);
                return 1;

            default:
                $this->error("  ✗ " . ($result['message'] ?? 'Unknown error'));
                return 1;
        }
    }

    /**
     * Show DNS setup instructions
     */
    protected function showInstructions(array $result): void
    {
        if (isset($result['instructions'])) {
            $this->newLine();
            $this->warn("  DNS Setup Instructions:");
            foreach ($result['instructions']['steps'] as $step) {
                $this->line("    {$step}");
            }
        }
    }
}
