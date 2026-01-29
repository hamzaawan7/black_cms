<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class CopyPagesToTenantsSeeder extends Seeder
{
    /**
     * Copy all pages from main tenant (1) to other tenants.
     * This gives new tenants a starting point with default pages.
     */
    public function run(): void
    {
        // Source tenant (main/default)
        $sourceTenantId = 1;
        
        // Target tenants
        $targetTenantIds = [2, 3]; // Demo Clinic, Test Wellness
        
        // Get all pages from source tenant
        $sourcePages = Page::where('tenant_id', $sourceTenantId)->get();
        
        if ($sourcePages->isEmpty()) {
            $this->command->warn('No pages found in source tenant.');
            return;
        }

        foreach ($targetTenantIds as $targetTenantId) {
            $this->command->info("Copying pages to Tenant {$targetTenantId}...");
            
            foreach ($sourcePages as $sourcePage) {
                // Check if page already exists for this tenant
                $existingPage = Page::where('tenant_id', $targetTenantId)
                    ->where('slug', $sourcePage->slug)
                    ->first();
                
                if ($existingPage) {
                    $this->command->line("  - Skipping '{$sourcePage->slug}' (already exists)");
                    continue;
                }
                
                // Create copy for target tenant
                $newPage = $sourcePage->replicate();
                $newPage->tenant_id = $targetTenantId;
                $newPage->save();
                
                $this->command->line("  + Copied '{$sourcePage->title}'");
            }
        }

        $this->command->info('Pages copied successfully!');
    }
}
