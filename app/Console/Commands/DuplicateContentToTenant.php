<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\Section;
use Illuminate\Console\Command;

class DuplicateContentToTenant extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant:duplicate-content 
                            {tenant_id : The ID of the tenant to duplicate content to}
                            {--source=1 : The source tenant ID (default: 1)}
                            {--force : Force duplicate even if tenant already has content}';

    /**
     * The console command description.
     */
    protected $description = 'Duplicate content from main tenant (or specified source) to a target tenant';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $targetTenantId = $this->argument('tenant_id');
        $sourceTenantId = $this->option('source');
        $force = $this->option('force');

        $sourceTenant = Tenant::find($sourceTenantId);
        $targetTenant = Tenant::find($targetTenantId);

        if (!$sourceTenant) {
            $this->error("Source tenant (ID: {$sourceTenantId}) not found!");
            return 1;
        }

        if (!$targetTenant) {
            $this->error("Target tenant (ID: {$targetTenantId}) not found!");
            return 1;
        }

        if ($sourceTenantId == $targetTenantId) {
            $this->error("Source and target tenant cannot be the same!");
            return 1;
        }

        // Check if target tenant already has content
        $hasContent = $targetTenant->pages()->exists() || 
                      $targetTenant->services()->exists() || 
                      $targetTenant->menus()->exists();

        if ($hasContent && !$force) {
            $this->warn("Target tenant '{$targetTenant->name}' already has content.");
            if (!$this->confirm('Do you want to continue? This will add duplicate content.')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        $this->info("Duplicating content from '{$sourceTenant->name}' to '{$targetTenant->name}'...");

        try {
            // Duplicate Settings
            $settingsCount = 0;
            foreach ($sourceTenant->tenantSettings()->get() as $setting) {
                // Skip if setting already exists
                if (!$targetTenant->tenantSettings()->where('key', $setting->key)->where('group', $setting->group)->exists()) {
                    $targetTenant->tenantSettings()->create([
                        'group' => $setting->group,
                        'key' => $setting->key,
                        'value' => $setting->value,
                    ]);
                    $settingsCount++;
                }
            }
            $this->line("  ✓ Settings duplicated: {$settingsCount}");

            // Duplicate Service Categories
            $categoryMapping = [];
            $categoriesCount = 0;
            foreach ($sourceTenant->serviceCategories()->get() as $category) {
                // Skip if category with same slug exists
                $existing = $targetTenant->serviceCategories()->where('slug', $category->slug)->first();
                if ($existing) {
                    $categoryMapping[$category->id] = $existing->id;
                } else {
                    $newCategory = $targetTenant->serviceCategories()->create([
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'image' => $category->image,
                        'order' => $category->order,
                        'is_active' => $category->is_active,
                    ]);
                    $categoryMapping[$category->id] = $newCategory->id;
                    $categoriesCount++;
                }
            }
            $this->line("  ✓ Service Categories duplicated: {$categoriesCount}");

            // Duplicate Services
            $servicesCount = 0;
            foreach ($sourceTenant->services()->get() as $service) {
                // Skip if service with same slug exists
                if (!$targetTenant->services()->where('slug', $service->slug)->exists()) {
                    $targetTenant->services()->create([
                        'category_id' => $categoryMapping[$service->category_id] ?? null,
                        'name' => $service->name,
                        'slug' => $service->slug,
                        'description' => $service->description,
                        'short_description' => $service->short_description,
                        'headline' => $service->headline,
                        'content' => $service->content,
                        'image' => $service->image,
                        'secondary_image' => $service->secondary_image,
                        'vial_image' => $service->vial_image,
                        'pricing' => $service->pricing,
                        'benefits' => $service->benefits,
                        'stats' => $service->stats,
                        'what_is' => $service->what_is,
                        'get_started_url' => $service->get_started_url,
                        'is_popular' => $service->is_popular,
                        'is_published' => $service->is_published,
                        'is_active' => $service->is_active,
                        'order' => $service->order,
                    ]);
                    $servicesCount++;
                }
            }
            $this->line("  ✓ Services duplicated: {$servicesCount}");

            // Duplicate Pages
            $pageMapping = [];
            $pagesCount = 0;
            foreach ($sourceTenant->pages()->get() as $page) {
                // Skip if page with same slug exists
                $existing = $targetTenant->pages()->where('slug', $page->slug)->first();
                if ($existing) {
                    $pageMapping[$page->id] = $existing->id;
                } else {
                    $newPage = $targetTenant->pages()->create([
                        'title' => $page->title,
                        'slug' => $page->slug,
                        'meta_title' => $page->meta_title,
                        'meta_description' => $page->meta_description,
                        'meta_keywords' => $page->meta_keywords,
                        'og_image' => $page->og_image,
                        'content' => $page->content,
                        'is_published' => $page->is_published,
                        'order' => $page->order,
                    ]);
                    $pageMapping[$page->id] = $newPage->id;
                    $pagesCount++;
                }
            }
            $this->line("  ✓ Pages duplicated: {$pagesCount}");

            // Duplicate Sections
            $sectionsCount = 0;
            $sourceSections = Section::where('tenant_id', $sourceTenant->id)->get();
            foreach ($sourceSections as $section) {
                $newPageId = $pageMapping[$section->page_id] ?? null;
                if ($newPageId) {
                    // Check if section already exists for this page
                    $existingSection = Section::where('tenant_id', $targetTenant->id)
                        ->where('page_id', $newPageId)
                        ->where('component_type', $section->component_type)
                        ->first();
                    
                    if (!$existingSection) {
                        Section::create([
                            'tenant_id' => $targetTenant->id,
                            'page_id' => $newPageId,
                            'component_type' => $section->component_type,
                            'type' => $section->type,
                            'order' => $section->order,
                            'is_visible' => $section->is_visible,
                            'content' => $section->content,
                            'styles' => $section->styles,
                            'settings' => $section->settings,
                        ]);
                        $sectionsCount++;
                    }
                }
            }
            $this->line("  ✓ Sections duplicated: {$sectionsCount}");

            // Duplicate FAQs
            $faqsCount = 0;
            foreach ($sourceTenant->faqs()->get() as $faq) {
                if (!$targetTenant->faqs()->where('question', $faq->question)->exists()) {
                    $targetTenant->faqs()->create([
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'category' => $faq->category,
                        'order' => $faq->order,
                        'is_published' => $faq->is_published,
                    ]);
                    $faqsCount++;
                }
            }
            $this->line("  ✓ FAQs duplicated: {$faqsCount}");

            // Duplicate Testimonials
            $testimonialsCount = 0;
            foreach ($sourceTenant->testimonials()->get() as $testimonial) {
                if (!$targetTenant->testimonials()->where('author_name', $testimonial->author_name)->exists()) {
                    $targetTenant->testimonials()->create([
                        'author_name' => $testimonial->author_name,
                        'author_title' => $testimonial->author_title,
                        'author_image' => $testimonial->author_image,
                        'content' => $testimonial->content,
                        'rating' => $testimonial->rating,
                        'is_featured' => $testimonial->is_featured,
                        'is_published' => $testimonial->is_published,
                        'order' => $testimonial->order,
                    ]);
                    $testimonialsCount++;
                }
            }
            $this->line("  ✓ Testimonials duplicated: {$testimonialsCount}");

            // Duplicate Team Members
            $teamCount = 0;
            foreach ($sourceTenant->teamMembers()->get() as $member) {
                if (!$targetTenant->teamMembers()->where('name', $member->name)->exists()) {
                    $targetTenant->teamMembers()->create([
                        'name' => $member->name,
                        'title' => $member->title,
                        'bio' => $member->bio,
                        'image' => $member->image,
                        'credentials' => $member->credentials,
                        'social_links' => $member->social_links,
                        'order' => $member->order,
                        'is_published' => $member->is_published,
                    ]);
                    $teamCount++;
                }
            }
            $this->line("  ✓ Team Members duplicated: {$teamCount}");

            // Duplicate Menus
            $menusCount = 0;
            foreach ($sourceTenant->menus()->get() as $menu) {
                if (!$targetTenant->menus()->where('location', $menu->location)->exists()) {
                    $targetTenant->menus()->create([
                        'name' => $menu->name,
                        'location' => $menu->location,
                        'items' => $menu->items,
                        'is_active' => $menu->is_active,
                    ]);
                    $menusCount++;
                }
            }
            $this->line("  ✓ Menus duplicated: {$menusCount}");

            $this->newLine();
            $this->info("✅ Content duplication completed successfully!");
            $this->info("Target tenant '{$targetTenant->name}' now has all content from '{$sourceTenant->name}'.");

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to duplicate content: " . $e->getMessage());
            return 1;
        }
    }
}
