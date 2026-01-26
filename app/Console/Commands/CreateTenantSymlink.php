<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CreateTenantSymlink extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant:symlink 
                            {tenant_id? : The ID of the tenant to create symlink for}
                            {--all : Create symlinks for all tenants with domains}
                            {--force : Force recreate symlink even if exists}';

    /**
     * The console command description.
     */
    protected $description = 'Create symbolic links for tenant domains pointing to main frontend';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $domainsBasePath = config('app.domains_base_path', '/home/u938549775/domains');
        $frontendPath = config('app.frontend_public_html', '/home/u938549775/domains/lightgray-stork-866970.hostingersite.com/public_html');

        $this->info("Domains Base Path: {$domainsBasePath}");
        $this->info("Frontend Path: {$frontendPath}");
        $this->newLine();

        if ($this->option('all')) {
            return $this->createAllSymlinks($domainsBasePath, $frontendPath);
        }

        $tenantId = $this->argument('tenant_id');
        
        if (!$tenantId) {
            $this->error('Please provide a tenant ID or use --all option');
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

        return $this->createSymlinkForTenant($tenant, $domainsBasePath, $frontendPath);
    }

    /**
     * Create symlinks for all tenants with domains.
     */
    protected function createAllSymlinks(string $domainsBasePath, string $frontendPath): int
    {
        $tenants = Tenant::whereNotNull('domain')
            ->where('domain', '!=', '')
            ->where('is_active', true)
            ->get();

        if ($tenants->isEmpty()) {
            $this->warn('No tenants with domains found.');
            return 0;
        }

        $this->info("Found {$tenants->count()} tenant(s) with domains.");
        $this->newLine();

        $successCount = 0;
        $failCount = 0;

        foreach ($tenants as $tenant) {
            $result = $this->createSymlinkForTenant($tenant, $domainsBasePath, $frontendPath);
            if ($result === 0) {
                $successCount++;
            } else {
                $failCount++;
            }
            $this->newLine();
        }

        $this->newLine();
        $this->info("Summary: {$successCount} successful, {$failCount} failed");

        return $failCount > 0 ? 1 : 0;
    }

    /**
     * Create symlink for a specific tenant.
     */
    protected function createSymlinkForTenant(Tenant $tenant, string $domainsBasePath, string $frontendPath): int
    {
        $this->info("Processing: {$tenant->name} ({$tenant->domain})");

        // Clean domain name
        $cleanDomain = preg_replace('#^https?://#', '', $tenant->domain);
        $cleanDomain = rtrim($cleanDomain, '/');

        $domainPath = "{$domainsBasePath}/{$cleanDomain}";
        $publicHtmlPath = "{$domainPath}/public_html";

        // Check if domain folder exists
        if (!is_dir($domainPath)) {
            $this->error("  ✗ Domain folder does not exist: {$domainPath}");
            $this->warn("    → Please add '{$cleanDomain}' in Hostinger panel first!");
            return 1;
        }

        $this->line("  Domain folder exists: {$domainPath}");

        // Check current state of public_html
        if (is_link($publicHtmlPath)) {
            $currentTarget = readlink($publicHtmlPath);
            if ($currentTarget === $frontendPath && !$this->option('force')) {
                $this->info("  ✓ Symlink already correct: {$publicHtmlPath} → {$frontendPath}");
                return 0;
            }
            
            $this->line("  Removing existing symlink...");
            if (!unlink($publicHtmlPath)) {
                $this->error("  ✗ Failed to remove existing symlink");
                return 1;
            }
        } elseif (is_dir($publicHtmlPath)) {
            // Check if it's empty or has default files only
            $files = array_diff(scandir($publicHtmlPath), ['.', '..', 'index.html', '.htaccess', 'default.html', 'cgi-bin']);
            
            if (!empty($files) && !$this->option('force')) {
                $this->error("  ✗ public_html contains custom files!");
                $this->warn("    Files: " . implode(', ', array_slice($files, 0, 5)));
                $this->warn("    → Use --force to remove, or backup and remove manually");
                return 1;
            }

            $this->line("  Removing existing public_html directory...");
            $this->removeDirectory($publicHtmlPath);
        }

        // Create symlink
        $this->line("  Creating symlink...");
        
        if (symlink($frontendPath, $publicHtmlPath)) {
            $this->info("  ✓ Symlink created: {$publicHtmlPath} → {$frontendPath}");
            
            // Update tenant record
            $tenant->update([
                'frontend_url' => "https://{$cleanDomain}",
                'deployment_status' => 'active',
            ]);
            
            return 0;
        }

        $this->error("  ✗ Failed to create symlink!");
        $this->warn("    Try running manually:");
        $this->line("    ln -s {$frontendPath} {$publicHtmlPath}");
        
        return 1;
    }

    /**
     * Recursively remove a directory.
     */
    protected function removeDirectory(string $dir): bool
    {
        if (!is_dir($dir)) {
            return false;
        }

        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = "{$dir}/{$file}";
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }

        return rmdir($dir);
    }
}
