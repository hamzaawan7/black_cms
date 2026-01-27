<?php

namespace App\Observers;

use App\Models\Tenant;
use App\Services\TenantContentService;
use Illuminate\Support\Facades\Log;

/**
 * TenantObserver
 * 
 * Automatically seeds content when a new tenant is created.
 */
class TenantObserver
{
    protected TenantContentService $contentService;

    public function __construct(TenantContentService $contentService)
    {
        $this->contentService = $contentService;
    }

    /**
     * Handle the Tenant "created" event.
     */
    public function created(Tenant $tenant): void
    {
        // Only auto-seed if the tenant doesn't have skip_auto_seed flag
        if (!($tenant->settings['skip_auto_seed'] ?? false)) {
            Log::info("TenantObserver: Auto-seeding content for new tenant: {$tenant->name}");
            
            try {
                $this->contentService->seedForTenant($tenant);
                Log::info("TenantObserver: Successfully seeded content for tenant: {$tenant->name}");
            } catch (\Exception $e) {
                Log::error("TenantObserver: Failed to seed content for tenant {$tenant->name}: " . $e->getMessage());
                // Don't throw - tenant creation should still succeed
            }
        }
    }

    /**
     * Handle the Tenant "updated" event.
     */
    public function updated(Tenant $tenant): void
    {
        // When tenant name changes, we might want to update some content
        if ($tenant->isDirty('name')) {
            Log::info("TenantObserver: Tenant name changed for {$tenant->id}");
            // Optionally update settings that reference tenant name
        }
    }

    /**
     * Handle the Tenant "deleted" event.
     */
    public function deleted(Tenant $tenant): void
    {
        Log::info("TenantObserver: Tenant deleted: {$tenant->name} (ID: {$tenant->id})");
        // Tenant data will be cascade deleted via foreign keys
    }
}
