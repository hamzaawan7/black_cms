<?php

namespace App\Services;

use App\Models\Faq;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Section;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Tenant;
use App\Models\Testimonial;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * TenantContentService
 * 
 * This service handles automatic content seeding when a new tenant is created.
 * It copies ALL data from Master Tenant (Tenant 1 - Hyve Wellness) to the new tenant.
 * 
 * APPROACH: Clone from Master Template
 * - Tenant 1 is the master template with all original content
 * - When new tenant is created, we copy Tenant 1's data to the new tenant
 * - Single source of truth - only Tenant 1 database needs to be maintained
 * - If Tenant 1 is updated, new tenants will get the updated content
 * 
 * Usage:
 * - Automatically triggered on Tenant creation via TenantObserver
 * - Can be manually called: app(TenantContentService::class)->seedForTenant($tenant)
 */
class TenantContentService
{
    /**
     * The master tenant ID to clone data from.
     * Tenant 1 = Hyve Wellness (original template)
     */
    protected const MASTER_TENANT_ID = 1;

    /**
     * Seed all content for a new tenant by cloning from Master Tenant.
     */
    public function seedForTenant(Tenant $tenant, array $options = []): void
    {
        $skipExisting = $options['skip_existing'] ?? true;
        $sourceTenantId = $options['source_tenant_id'] ?? self::MASTER_TENANT_ID;
        
        // Don't clone to the master tenant itself
        if ($tenant->id === $sourceTenantId) {
            Log::info("Skipping seed for master tenant (ID: {$tenant->id})");
            return;
        }

        Log::info("Starting content cloning for tenant: {$tenant->name} (ID: {$tenant->id}) from Master Tenant (ID: {$sourceTenantId})");

        DB::transaction(function () use ($tenant, $sourceTenantId, $skipExisting) {
            // Clone all data from master tenant
            $this->clonePages($tenant, $sourceTenantId, $skipExisting);
            $this->cloneServiceCategories($tenant, $sourceTenantId, $skipExisting);
            $this->cloneServices($tenant, $sourceTenantId, $skipExisting);
            $this->cloneTeamMembers($tenant, $sourceTenantId, $skipExisting);
            $this->cloneTestimonials($tenant, $sourceTenantId, $skipExisting);
            $this->cloneFaqs($tenant, $sourceTenantId, $skipExisting);
            $this->cloneMenus($tenant, $sourceTenantId, $skipExisting);
            $this->cloneSettings($tenant, $sourceTenantId, $skipExisting);
        });

        Log::info("Completed content cloning for tenant: {$tenant->name}");
    }

    /**
     * Clone pages and their sections from master tenant.
     */
    protected function clonePages(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourcePages = Page::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourcePages as $sourcePage) {
            // Clone page
            $newPage = Page::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'slug' => $sourcePage->slug],
                [
                    'tenant_id' => $tenant->id,
                    'title' => $sourcePage->title,
                    'slug' => $sourcePage->slug,
                    'meta_title' => str_replace('Hyve Wellness', $tenant->name, $sourcePage->meta_title ?? ''),
                    'meta_description' => str_replace('Hyve Wellness', $tenant->name, $sourcePage->meta_description ?? ''),
                    'order' => $sourcePage->order,
                    'is_published' => $sourcePage->is_published,
                ]
            );

            // Clone sections for this page
            $this->cloneSections($tenant, $sourceTenantId, $sourcePage->id, $newPage->id, $skipExisting);
        }

        Log::info("Cloned " . $sourcePages->count() . " pages for tenant {$tenant->id}");
    }

    /**
     * Clone sections from source page to target page.
     */
    protected function cloneSections(Tenant $tenant, int $sourceTenantId, int $sourcePageId, int $targetPageId, bool $skipExisting): void
    {
        $sourceSections = Section::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->where('page_id', $sourcePageId)
            ->get();

        // If force mode, delete existing sections first
        if (!$skipExisting) {
            Section::withoutGlobalScope('tenant')
                ->where('tenant_id', $tenant->id)
                ->where('page_id', $targetPageId)
                ->delete();
        }

        foreach ($sourceSections as $sourceSection) {
            // Replace tenant name in content if it's an array
            $content = $sourceSection->content;
            if (is_array($content)) {
                $content = $this->replaceTenantNameInContent($content, $tenant->name);
            }

            Section::withoutGlobalScope('tenant')->updateOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'page_id' => $targetPageId,
                    'component_type' => $sourceSection->component_type,
                ],
                [
                    'tenant_id' => $tenant->id,
                    'page_id' => $targetPageId,
                    'name' => $sourceSection->name,
                    'component_type' => $sourceSection->component_type,
                    'content' => $content,
                    'styles' => $sourceSection->styles,
                    'settings' => $sourceSection->settings,
                    'order' => $sourceSection->order,
                    'is_visible' => $sourceSection->is_visible,
                ]
            );
        }
    }

    /**
     * Replace "Hyve Wellness" with new tenant name in content array.
     */
    protected function replaceTenantNameInContent(array $content, string $newTenantName): array
    {
        array_walk_recursive($content, function (&$value) use ($newTenantName) {
            if (is_string($value)) {
                $value = str_replace('Hyve Wellness', $newTenantName, $value);
            }
        });
        return $content;
    }

    /**
     * Clone service categories from master tenant.
     */
    protected function cloneServiceCategories(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceCategories = ServiceCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceCategories as $source) {
            ServiceCategory::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'slug' => $source->slug],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $source->name,
                    'slug' => $source->slug,
                    'description' => $source->description,
                    'image' => $source->image,
                    'order' => $source->order,
                    'is_active' => $source->is_active,
                ]
            );
        }

        Log::info("Cloned " . $sourceCategories->count() . " service categories for tenant {$tenant->id}");
    }

    /**
     * Clone services from master tenant.
     */
    protected function cloneServices(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        // Build category slug to new ID mapping
        $categoryMapping = [];
        $sourceCategories = ServiceCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();
        $newCategories = ServiceCategory::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenant->id)
            ->get()
            ->keyBy('slug');

        foreach ($sourceCategories as $sourceCategory) {
            if (isset($newCategories[$sourceCategory->slug])) {
                $categoryMapping[$sourceCategory->id] = $newCategories[$sourceCategory->slug]->id;
            }
        }

        $sourceServices = Service::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceServices as $source) {
            $newCategoryId = $categoryMapping[$source->category_id] ?? null;
            if (!$newCategoryId) continue;

            Service::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'slug' => $source->slug],
                [
                    'tenant_id' => $tenant->id,
                    'category_id' => $newCategoryId,
                    'name' => $source->name,
                    'slug' => $source->slug,
                    'description' => $source->description,
                    'headline' => $source->headline,
                    'pricing' => $source->pricing,
                    'image' => $source->image,
                    'secondary_image' => $source->secondary_image,
                    'vial_image' => $source->vial_image,
                    'short_description' => $source->short_description,
                    'content' => $source->content,
                    'stats' => $source->stats,
                    'benefits' => $source->benefits,
                    'what_is' => $source->what_is,
                    'get_started_url' => $source->get_started_url,
                    'is_popular' => $source->is_popular,
                    'is_published' => $source->is_published,
                    'order' => $source->order,
                ]
            );
        }

        Log::info("Cloned " . $sourceServices->count() . " services for tenant {$tenant->id}");
    }

    /**
     * Clone team members from master tenant.
     */
    protected function cloneTeamMembers(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceMembers = TeamMember::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceMembers as $source) {
            TeamMember::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $source->name],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $source->name,
                    'title' => $source->title,
                    'bio' => $source->bio,
                    'image' => $source->image,
                    'order' => $source->order,
                    'is_published' => $source->is_published ?? true,
                ]
            );
        }

        Log::info("Cloned " . $sourceMembers->count() . " team members for tenant {$tenant->id}");
    }

    /**
     * Clone testimonials from master tenant.
     */
    protected function cloneTestimonials(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceTestimonials = Testimonial::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceTestimonials as $source) {
            Testimonial::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'author_name' => $source->author_name],
                [
                    'tenant_id' => $tenant->id,
                    'author_name' => $source->author_name,
                    'author_title' => $source->author_title,
                    'author_image' => $source->author_image,
                    'content' => $source->content,
                    'rating' => $source->rating,
                    'is_featured' => $source->is_featured,
                    'is_published' => $source->is_published,
                    'order' => $source->order,
                ]
            );
        }

        Log::info("Cloned " . $sourceTestimonials->count() . " testimonials for tenant {$tenant->id}");
    }

    /**
     * Clone FAQs from master tenant.
     */
    protected function cloneFaqs(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceFaqs = Faq::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceFaqs as $source) {
            Faq::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'question' => $source->question],
                [
                    'tenant_id' => $tenant->id,
                    'question' => $source->question,
                    'answer' => $source->answer,
                    'category' => $source->category,
                    'order' => $source->order,
                    'is_published' => $source->is_published ?? true,
                ]
            );
        }

        Log::info("Cloned " . $sourceFaqs->count() . " FAQs for tenant {$tenant->id}");
    }

    /**
     * Clone menus from master tenant.
     */
    protected function cloneMenus(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceMenus = Menu::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceMenus as $source) {
            Menu::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'location' => $source->location],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $source->name,
                    'location' => $source->location,
                    'items' => $source->items,
                    'is_active' => $source->is_active,
                ]
            );
        }

        Log::info("Cloned " . $sourceMenus->count() . " menus for tenant {$tenant->id}");
    }

    /**
     * Clone settings from master tenant.
     */
    protected function cloneSettings(Tenant $tenant, int $sourceTenantId, bool $skipExisting): void
    {
        $sourceSettings = Setting::withoutGlobalScope('tenant')
            ->where('tenant_id', $sourceTenantId)
            ->get();

        foreach ($sourceSettings as $source) {
            // Replace tenant-specific values
            $value = $source->value;
            if ($source->key === 'site_name') {
                $value = $tenant->name;
            } elseif ($source->key === 'contact_email' && $tenant->contact_email) {
                $value = $tenant->contact_email;
            } elseif ($source->key === 'contact_phone' && $tenant->contact_phone) {
                $value = $tenant->contact_phone;
            } elseif (is_string($value)) {
                $value = str_replace('Hyve Wellness', $tenant->name, $value);
            }

            Setting::withoutGlobalScope('tenant')->updateOrCreate(
                ['tenant_id' => $tenant->id, 'key' => $source->key],
                [
                    'tenant_id' => $tenant->id,
                    'key' => $source->key,
                    'value' => $value,
                    'group' => $source->group,
                ]
            );
        }

        Log::info("Cloned " . $sourceSettings->count() . " settings for tenant {$tenant->id}");
    }
}
