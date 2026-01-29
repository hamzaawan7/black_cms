<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Section;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Setting;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class CopyAllContentToTenantsSeeder extends Seeder
{
    /**
     * Copy all content from main tenant (1) to other tenants.
     * This gives new tenants a starting point with default content.
     */
    public function run(): void
    {
        // Source tenant (main/default)
        $sourceTenantId = 1;
        
        // Target tenants
        $targetTenantIds = [2, 3]; // Demo Clinic, Test Wellness
        
        foreach ($targetTenantIds as $targetTenantId) {
            $this->command->info("=== Copying content to Tenant {$targetTenantId} ===");
            
            // 1. Copy Settings (appearance, colors, etc.)
            $this->copySettings($sourceTenantId, $targetTenantId);
            
            // 2. Copy Service Categories (needed before services)
            $this->copyServiceCategories($sourceTenantId, $targetTenantId);
            
            // 3. Copy Services
            $this->copyServices($sourceTenantId, $targetTenantId);
            
            // 4. Copy Pages (and get page ID mapping)
            $pageMap = $this->copyPages($sourceTenantId, $targetTenantId);
            
            // 5. Copy Sections (using page ID mapping)
            $this->copySections($sourceTenantId, $targetTenantId, $pageMap);
            
            // 6. Copy Testimonials
            $this->copyTestimonials($sourceTenantId, $targetTenantId);
            
            // 7. Copy FAQs
            $this->copyFaqs($sourceTenantId, $targetTenantId);
            
            // 8. Copy Team Members
            $this->copyTeamMembers($sourceTenantId, $targetTenantId);
            
            $this->command->info("");
        }

        $this->command->info('All content copied successfully!');
    }

    protected function copySettings(int $sourceId, int $targetId): void
    {
        $items = Setting::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        foreach ($items as $item) {
            $exists = Setting::where('tenant_id', $targetId)
                ->where('key', $item->key)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            Setting::create([
                'tenant_id' => $targetId,
                'key' => $item->key,
                'value' => $item->value,
                'group' => $item->group,
            ]);
            $copied++;
        }
        
        $this->command->line("  Settings: {$copied} copied, {$skipped} skipped");
    }

    protected function copyServiceCategories(int $sourceId, int $targetId): void
    {
        $items = ServiceCategory::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        // Map old category IDs to new category IDs
        $categoryMap = [];
        
        foreach ($items as $item) {
            $exists = ServiceCategory::where('tenant_id', $targetId)
                ->where('slug', $item->slug)
                ->first();
            
            if ($exists) {
                $categoryMap[$item->id] = $exists->id;
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->save();
            
            $categoryMap[$item->id] = $new->id;
            $copied++;
        }
        
        // Store category map for services
        $this->categoryMap[$targetId] = $categoryMap;
        
        $this->command->line("  Categories: {$copied} copied, {$skipped} skipped");
    }

    protected array $categoryMap = [];

    protected function copyServices(int $sourceId, int $targetId): void
    {
        $items = Service::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        $categoryMap = $this->categoryMap[$targetId] ?? [];
        
        foreach ($items as $item) {
            $exists = Service::where('tenant_id', $targetId)
                ->where('slug', $item->slug)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            
            // Map category ID to new tenant's category
            if ($item->category_id && isset($categoryMap[$item->category_id])) {
                $new->category_id = $categoryMap[$item->category_id];
            }
            
            $new->save();
            $copied++;
        }
        
        $this->command->line("  Services: {$copied} copied, {$skipped} skipped");
    }

    protected function copyPages(int $sourceId, int $targetId): array
    {
        $items = Page::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        $pageMap = []; // Map old page ID to new page ID
        
        foreach ($items as $item) {
            $exists = Page::where('tenant_id', $targetId)
                ->where('slug', $item->slug)
                ->first();
            
            if ($exists) {
                // Map existing page ID
                $pageMap[$item->id] = $exists->id;
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->save();
            
            // Map new page ID
            $pageMap[$item->id] = $new->id;
            $copied++;
        }
        
        $this->command->line("  Pages: {$copied} copied, {$skipped} skipped");
        
        return $pageMap;
    }

    protected function copySections(int $sourceId, int $targetId, array $pageMap): void
    {
        $items = Section::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        foreach ($items as $item) {
            // Get target page ID from mapping
            $targetPageId = $pageMap[$item->page_id] ?? null;
            
            if (!$targetPageId) {
                $this->command->warn("  ! Section skipped: page_id {$item->page_id} not mapped");
                $skipped++;
                continue;
            }
            
            // Check if section already exists for this page and component type
            $exists = Section::where('tenant_id', $targetId)
                ->where('page_id', $targetPageId)
                ->where('component_type', $item->component_type)
                ->where('order', $item->order)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->page_id = $targetPageId;
            $new->save();
            $copied++;
        }
        
        $this->command->line("  Sections: {$copied} copied, {$skipped} skipped");
    }

    protected function copyTestimonials(int $sourceId, int $targetId): void
    {
        $items = Testimonial::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        foreach ($items as $item) {
            // For testimonials, check by author_name since there's no slug
            $exists = Testimonial::where('tenant_id', $targetId)
                ->where('author_name', $item->author_name)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->save();
            $copied++;
        }
        
        $this->command->line("  Testimonials: {$copied} copied, {$skipped} skipped");
    }

    protected function copyFaqs(int $sourceId, int $targetId): void
    {
        $items = Faq::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        foreach ($items as $item) {
            // For FAQs, check by question
            $exists = Faq::where('tenant_id', $targetId)
                ->where('question', $item->question)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->save();
            $copied++;
        }
        
        $this->command->line("  FAQs: {$copied} copied, {$skipped} skipped");
    }

    protected function copyTeamMembers(int $sourceId, int $targetId): void
    {
        $items = TeamMember::where('tenant_id', $sourceId)->get();
        $copied = 0;
        $skipped = 0;
        
        foreach ($items as $item) {
            // For team members, check by name
            $exists = TeamMember::where('tenant_id', $targetId)
                ->where('name', $item->name)
                ->first();
            
            if ($exists) {
                $skipped++;
                continue;
            }
            
            $new = $item->replicate();
            $new->tenant_id = $targetId;
            $new->save();
            $copied++;
        }
        
        $this->command->line("  Team Members: {$copied} copied, {$skipped} skipped");
    }
}
