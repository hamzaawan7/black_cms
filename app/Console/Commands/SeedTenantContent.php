<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Services\TenantContentService;
use Illuminate\Console\Command;

class SeedTenantContent extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant:seed-content 
                            {tenant? : Tenant ID or slug (optional, all tenants if not provided)}
                            {--force : Force re-seed even if content exists}
                            {--dry-run : Show what would be seeded without actually seeding}';

    /**
     * The console command description.
     */
    protected $description = 'Seed pages, sections, and sample content for a tenant';

    protected TenantContentService $contentService;

    public function __construct(TenantContentService $contentService)
    {
        parent::__construct();
        $this->contentService = $contentService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $tenantIdentifier = $this->argument('tenant');
        $force = $this->option('force');
        $dryRun = $this->option('dry-run');

        if ($tenantIdentifier) {
            // Seed specific tenant
            $tenant = $this->findTenant($tenantIdentifier);
            
            if (!$tenant) {
                $this->error("Tenant not found: {$tenantIdentifier}");
                return Command::FAILURE;
            }

            return $this->seedTenant($tenant, $force, $dryRun);
        }

        // Seed all tenants
        $tenants = Tenant::all();

        if ($tenants->isEmpty()) {
            $this->warn('No tenants found in the system.');
            return Command::SUCCESS;
        }

        $this->info("Found {$tenants->count()} tenant(s)");

        if (!$dryRun && !$this->confirm('Do you want to seed content for ALL tenants?')) {
            $this->info('Operation cancelled.');
            return Command::SUCCESS;
        }

        $successCount = 0;
        $failCount = 0;

        foreach ($tenants as $tenant) {
            $result = $this->seedTenant($tenant, $force, $dryRun);
            if ($result === Command::SUCCESS) {
                $successCount++;
            } else {
                $failCount++;
            }
        }

        $this->newLine();
        $this->info("Completed: {$successCount} successful, {$failCount} failed");

        return $failCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    /**
     * Find tenant by ID or slug.
     */
    protected function findTenant(string $identifier): ?Tenant
    {
        // Try finding by ID first
        if (is_numeric($identifier)) {
            $tenant = Tenant::find($identifier);
            if ($tenant) return $tenant;
        }

        // Try finding by slug
        return Tenant::where('slug', $identifier)->first();
    }

    /**
     * Seed content for a specific tenant.
     */
    protected function seedTenant(Tenant $tenant, bool $force, bool $dryRun): int
    {
        $this->newLine();
        $this->info("Processing tenant: {$tenant->name} (ID: {$tenant->id})");

        if ($dryRun) {
            $this->line('  [DRY RUN] Would seed:');
            $this->line('    - 6 pages (home, about, services, contact, privacy-policy, terms-of-service)');
            $this->line('    - Sections for each page');
            $this->line('    - 3 service categories');
            $this->line('    - 3 sample services');
            $this->line('    - 3 team members');
            $this->line('    - 3 testimonials');
            $this->line('    - 4 FAQs');
            $this->line('    - 2 menus (header, footer)');
            $this->line('    - Default settings');
            return Command::SUCCESS;
        }

        try {
            $options = [
                'skip_existing' => !$force,
            ];

            $this->contentService->seedForTenant($tenant, $options);
            
            $this->info("  ✓ Successfully seeded content for {$tenant->name}");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("  ✗ Failed to seed content: " . $e->getMessage());
            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }
            return Command::FAILURE;
        }
    }
}
