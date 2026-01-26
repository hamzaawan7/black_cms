<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Template;
use App\Repositories\Contracts\TenantRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Tenant Service
 * 
 * Handles business logic for tenant management.
 */
class TenantService
{
    /**
     * @var TenantRepositoryInterface
     */
    protected TenantRepositoryInterface $tenantRepository;

    /**
     * @var SettingService
     */
    protected SettingService $settingService;

    /**
     * @var NginxConfigService
     */
    protected NginxConfigService $nginxService;

    /**
     * @var TenantDeploymentService
     */
    protected TenantDeploymentService $deploymentService;

    /**
     * Create a new service instance.
     *
     * @param TenantRepositoryInterface $tenantRepository
     * @param SettingService $settingService
     * @param NginxConfigService $nginxService
     * @param TenantDeploymentService $deploymentService
     */
    public function __construct(
        TenantRepositoryInterface $tenantRepository,
        SettingService $settingService,
        NginxConfigService $nginxService,
        TenantDeploymentService $deploymentService
    ) {
        $this->tenantRepository = $tenantRepository;
        $this->settingService = $settingService;
        $this->nginxService = $nginxService;
        $this->deploymentService = $deploymentService;
    }

    /**
     * Get paginated tenants.
     *
     * @param int $perPage
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        return $this->tenantRepository->getFiltered($filters, $search, $perPage);
    }

    /**
     * Get all tenants.
     */
    public function getAll(): Collection
    {
        return Tenant::with('activeTemplate')->orderBy('name')->get();
    }

    /**
     * Get a tenant by ID.
     */
    public function getById(int $id): ?Tenant
    {
        return Tenant::with(['activeTemplate', 'users'])->find($id);
    }

    /**
     * Get a tenant by domain.
     */
    public function getByDomain(string $domain): ?Tenant
    {
        return Tenant::with('activeTemplate')
            ->where('domain', $domain)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get a tenant by slug.
     */
    public function getBySlug(string $slug): ?Tenant
    {
        return Tenant::with('activeTemplate')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Create a new tenant.
     */
    public function create(array $data): Tenant
    {
        // Generate slug if not provided
        if (!isset($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // Auto-set API base URL to current CMS URL (all tenants use same CMS)
        if (!isset($data['api_base_url'])) {
            $data['api_base_url'] = config('app.url') . '/api/v1';
        }

        // Set deployment path based on tenant slug
        $basePath = config('app.deployment_base_path', '/var/www/templates');
        $data['deployment_path'] = "{$basePath}/{$data['slug']}";

        $tenant = Tenant::create($data);

        // Generate API key for the tenant
        $tenant->regenerateApiKey();

        // If domain is provided, create symlink for shared hosting
        if (!empty($data['domain'])) {
            $this->createDomainSymlink($tenant, $data['domain']);
            $this->generateNginxForTenant($tenant);
        }

        // If template is assigned, trigger deployment
        if ($tenant->active_template_id && $tenant->activeTemplate) {
            $this->deploymentService->deployTemplate($tenant, $tenant->activeTemplate);
        }

        // Duplicate content from main tenant (ID: 1) if this is a new tenant
        $this->duplicateContentFromMainTenant($tenant);

        return $tenant->load('activeTemplate');
    }

    /**
     * Duplicate all content from main tenant (ID: 1) to a new tenant.
     * This includes: Settings, Service Categories, Services, Pages, Sections, 
     * FAQs, Testimonials, Team Members, and Menus.
     * 
     * @param Tenant $newTenant The tenant to duplicate content to
     * @param bool $force If true, will duplicate even if content already exists
     */
    public function duplicateContentFromMainTenant(Tenant $newTenant, bool $force = false): void
    {
        // Get main tenant (ID: 1)
        $mainTenant = Tenant::find(1);
        
        if (!$mainTenant || $newTenant->id === 1) {
            return; // Don't duplicate if main tenant doesn't exist or if this IS the main tenant
        }

        // Check if tenant already has content (unless force is true)
        if (!$force) {
            $hasContent = $newTenant->pages()->count() > 0 
                || $newTenant->services()->count() > 0 
                || $newTenant->serviceCategories()->count() > 0;
            
            if ($hasContent) {
                \Log::info("Tenant {$newTenant->id} already has content, skipping duplication");
                return;
            }
        }

        try {
            // Duplicate Settings
            foreach ($mainTenant->tenantSettings()->get() as $setting) {
                $newTenant->tenantSettings()->create([
                    'group' => $setting->group,
                    'key' => $setting->key,
                    'value' => $setting->value,
                ]);
            }

            // Duplicate Service Categories first (needed for services)
            $categoryMapping = [];
            foreach ($mainTenant->serviceCategories()->get() as $category) {
                $newCategory = $newTenant->serviceCategories()->create([
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'image' => $category->image,
                    'order' => $category->order,
                    'is_active' => $category->is_active,
                ]);
                $categoryMapping[$category->id] = $newCategory->id;
            }

            // Duplicate Services with category mapping
            foreach ($mainTenant->services()->get() as $service) {
                $newTenant->services()->create([
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
            }

            // Duplicate Pages first (needed for sections)
            $pageMapping = [];
            foreach ($mainTenant->pages()->get() as $page) {
                $newPage = $newTenant->pages()->create([
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
            }

            // Duplicate Sections with page mapping
            $mainSections = \App\Models\Section::where('tenant_id', $mainTenant->id)->get();
            foreach ($mainSections as $section) {
                \App\Models\Section::create([
                    'tenant_id' => $newTenant->id,
                    'page_id' => $pageMapping[$section->page_id] ?? null,
                    'type' => $section->type,
                    'order' => $section->order,
                    'is_visible' => $section->is_visible,
                    'content' => $section->content,
                    'styles' => $section->styles,
                    'settings' => $section->settings,
                ]);
            }

            // Duplicate FAQs
            foreach ($mainTenant->faqs()->get() as $faq) {
                $newTenant->faqs()->create([
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                    'category' => $faq->category,
                    'order' => $faq->order,
                    'is_published' => $faq->is_published,
                ]);
            }

            // Duplicate Testimonials
            foreach ($mainTenant->testimonials()->get() as $testimonial) {
                $newTenant->testimonials()->create([
                    'author_name' => $testimonial->author_name,
                    'author_title' => $testimonial->author_title,
                    'author_image' => $testimonial->author_image,
                    'content' => $testimonial->content,
                    'rating' => $testimonial->rating,
                    'is_featured' => $testimonial->is_featured,
                    'is_published' => $testimonial->is_published,
                    'order' => $testimonial->order,
                ]);
            }

            // Duplicate Team Members
            foreach ($mainTenant->teamMembers()->get() as $member) {
                $newTenant->teamMembers()->create([
                    'name' => $member->name,
                    'title' => $member->title,
                    'bio' => $member->bio,
                    'image' => $member->image,
                    'credentials' => $member->credentials,
                    'social_links' => $member->social_links,
                    'order' => $member->order,
                    'is_published' => $member->is_published,
                ]);
            }

            // Duplicate Menus
            foreach ($mainTenant->menus()->get() as $menu) {
                $newTenant->menus()->create([
                    'name' => $menu->name,
                    'location' => $menu->location,
                    'items' => $menu->items,
                    'is_active' => $menu->is_active,
                ]);
            }

            \Log::info("Successfully duplicated content from main tenant to tenant {$newTenant->id} ({$newTenant->name})");
        } catch (\Exception $e) {
            \Log::error("Failed to duplicate content from main tenant to tenant {$newTenant->id}: " . $e->getMessage());
        }
    }

    /**
     * Create symbolic link for domain to point to frontend folder.
     * This is for shared hosting where NGINX control is not available.
     */
    public function createDomainSymlink(Tenant $tenant, string $domain): array
    {
        try {
            // Get paths from config
            $domainsBasePath = config('app.domains_base_path', '/home/u938549775/domains');
            $frontendPath = config('app.frontend_public_html', '/home/u938549775/domains/lightgray-stork-866970.hostingersite.com/public_html');
            
            // Clean domain name (remove protocol if any)
            $cleanDomain = preg_replace('#^https?://#', '', $domain);
            $cleanDomain = rtrim($cleanDomain, '/');
            
            $domainPath = "{$domainsBasePath}/{$cleanDomain}";
            $publicHtmlPath = "{$domainPath}/public_html";
            
            // Check if domain folder exists (created by Hostinger when domain is added)
            if (!is_dir($domainPath)) {
                \Log::warning("Domain folder does not exist yet: {$domainPath}. Domain must be added in Hostinger panel first.");
                return [
                    'success' => false,
                    'message' => "Domain folder not found. Please add '{$cleanDomain}' in Hostinger panel first.",
                    'domain_path' => $domainPath,
                ];
            }
            
            // Check if public_html already exists
            if (is_link($publicHtmlPath)) {
                // Already a symlink, check if pointing to correct location
                $currentTarget = readlink($publicHtmlPath);
                if ($currentTarget === $frontendPath) {
                    \Log::info("Symlink already exists and points to correct location: {$publicHtmlPath}");
                    return [
                        'success' => true,
                        'message' => 'Symlink already configured correctly',
                        'symlink_path' => $publicHtmlPath,
                    ];
                }
                // Remove incorrect symlink
                unlink($publicHtmlPath);
            } elseif (is_dir($publicHtmlPath)) {
                // Regular directory exists, need to remove it
                // Be careful - only remove if empty or contains default files
                $files = scandir($publicHtmlPath);
                $defaultFiles = ['.', '..', 'index.html', '.htaccess', 'default.html'];
                $hasCustomFiles = false;
                
                foreach ($files as $file) {
                    if (!in_array($file, $defaultFiles)) {
                        $hasCustomFiles = true;
                        break;
                    }
                }
                
                if ($hasCustomFiles) {
                    \Log::warning("Cannot create symlink - public_html contains custom files: {$publicHtmlPath}");
                    return [
                        'success' => false,
                        'message' => 'public_html folder contains custom files. Please backup and remove manually.',
                        'public_html_path' => $publicHtmlPath,
                    ];
                }
                
                // Remove empty/default public_html directory
                $this->removeDirectory($publicHtmlPath);
            }
            
            // Create symlink
            if (symlink($frontendPath, $publicHtmlPath)) {
                \Log::info("Symlink created successfully: {$publicHtmlPath} -> {$frontendPath}");
                
                // Update tenant record
                $tenant->update([
                    'frontend_url' => "https://{$cleanDomain}",
                    'deployment_status' => 'active',
                ]);
                
                return [
                    'success' => true,
                    'message' => 'Symlink created successfully',
                    'symlink_path' => $publicHtmlPath,
                    'target_path' => $frontendPath,
                ];
            } else {
                \Log::error("Failed to create symlink: {$publicHtmlPath} -> {$frontendPath}");
                return [
                    'success' => false,
                    'message' => 'Failed to create symlink. Check permissions.',
                ];
            }
            
        } catch (\Exception $e) {
            \Log::error("Error creating domain symlink: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Remove directory recursively.
     */
    protected function removeDirectory(string $path): bool
    {
        if (!is_dir($path)) {
            return false;
        }
        
        $files = array_diff(scandir($path), ['.', '..']);
        foreach ($files as $file) {
            $filePath = "{$path}/{$file}";
            is_dir($filePath) ? $this->removeDirectory($filePath) : unlink($filePath);
        }
        
        return rmdir($path);
    }

    /**
     * Generate NGINX configuration for a tenant.
     */
    public function generateNginxForTenant(Tenant $tenant): array
    {
        if (!$tenant->domain) {
            return ['success' => false, 'message' => 'No domain configured'];
        }

        $deploymentPath = $tenant->deployment_path ?? $this->deploymentService->getDeploymentPath($tenant);
        
        // Generate NGINX config for primary domain
        $result = $this->nginxService->generateConfig($tenant, $tenant->domain, $deploymentPath);
        
        if ($result['success']) {
            $tenant->update([
                'nginx_config_path' => $result['config_path'],
                'deployment_path' => $deploymentPath,
            ]);
        }

        // Generate configs for additional domains
        $additionalDomains = $tenant->additional_domains ?? [];
        foreach ($additionalDomains as $domain) {
            $this->nginxService->generateConfig($tenant, $domain, $deploymentPath);
        }

        return $result;
    }

    /**
     * Update a tenant.
     */
    public function update(Tenant $tenant, array $data): Tenant
    {
        $oldDomain = $tenant->domain;
        $oldTemplateId = $tenant->active_template_id;
        
        $tenant->update($data);
        $tenant->refresh();

        // If domain changed, regenerate NGINX config
        if (isset($data['domain']) && $data['domain'] !== $oldDomain) {
            // Delete old NGINX config if exists
            if ($oldDomain) {
                $this->nginxService->removeConfig($oldDomain);
            }
            // Generate new NGINX config
            $this->generateNginxForTenant($tenant);
        }

        // If template changed, redeploy
        if (isset($data['active_template_id']) && $data['active_template_id'] !== $oldTemplateId) {
            if ($tenant->activeTemplate) {
                $this->deploymentService->deployTemplate($tenant, $tenant->activeTemplate);
            }
        }

        return $tenant->fresh(['activeTemplate']);
    }

    /**
     * Delete a tenant.
     */
    public function delete(Tenant $tenant): bool
    {
        // Note: This will cascade delete all tenant data
        // Make sure to handle media files cleanup
        return $tenant->delete();
    }

    /**
     * Toggle tenant active status.
     */
    public function toggleActive(Tenant $tenant): Tenant
    {
        $tenant->update(['is_active' => !$tenant->is_active]);
        return $tenant->fresh();
    }

    /**
     * Assign a template to a tenant.
     */
    public function assignTemplate(Tenant $tenant, int $templateId): Tenant
    {
        $template = Template::findOrFail($templateId);
        $tenant->update(['active_template_id' => $template->id]);
        return $tenant->fresh(['activeTemplate']);
    }

    /**
     * Get tenant statistics.
     */
    public function getStatistics(Tenant $tenant): array
    {
        return [
            'pages' => $tenant->pages()->count(),
            'services' => $tenant->services()->count(),
            'faqs' => $tenant->faqs()->count(),
            'testimonials' => $tenant->testimonials()->count(),
            'team_members' => $tenant->teamMembers()->count(),
            'media' => $tenant->media()->count(),
            'users' => $tenant->users()->count(),
        ];
    }

    /**
     * Generate a unique slug for the tenant.
     */
    protected function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Duplicate a tenant with all its data.
     * 
     * This creates a complete copy of the tenant including:
     * - Settings
     * - Pages and Sections
     * - Services and Categories
     * - FAQs, Testimonials, Team Members
     * - Menus
     * 
     * @param Tenant $sourceTenant The tenant to duplicate
     * @param string $newName Name for the new tenant
     * @param string|null $newDomain Optional domain for the new tenant
     * @return Tenant The newly created tenant
     */
    public function duplicate(Tenant $sourceTenant, string $newName, ?string $newDomain = null): Tenant
    {
        $newSlug = $this->generateUniqueSlug($newName);

        // Create the new tenant
        $newTenant = Tenant::create([
            'name' => $newName,
            'slug' => $newSlug,
            'domain' => $newDomain,
            'logo' => $sourceTenant->logo,
            'favicon' => $sourceTenant->favicon,
            'active_template_id' => $sourceTenant->active_template_id,
            'is_active' => false, // Start as inactive for safety
        ]);

        // Duplicate Settings
        foreach ($sourceTenant->settings()->get() as $setting) {
            $newTenant->settings()->create([
                'group' => $setting->group,
                'key' => $setting->key,
                'value' => $setting->value,
            ]);
        }

        // Duplicate Service Categories first (needed for services)
        $categoryMapping = [];
        foreach ($sourceTenant->serviceCategories()->get() as $category) {
            $newCategory = $newTenant->serviceCategories()->create([
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
                'order' => $category->order,
                'is_active' => $category->is_active,
            ]);
            $categoryMapping[$category->id] = $newCategory->id;
        }

        // Duplicate Services with category mapping
        foreach ($sourceTenant->services()->get() as $service) {
            $newTenant->services()->create([
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
        }

        // Duplicate Pages first (needed for sections)
        $pageMapping = [];
        foreach ($sourceTenant->pages()->get() as $page) {
            $newPage = $newTenant->pages()->create([
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
        }

        // Duplicate Sections with page mapping
        $sourceSections = \App\Models\Section::where('tenant_id', $sourceTenant->id)->get();
        foreach ($sourceSections as $section) {
            \App\Models\Section::create([
                'tenant_id' => $newTenant->id,
                'page_id' => $pageMapping[$section->page_id] ?? null,
                'type' => $section->type,
                'order' => $section->order,
                'is_visible' => $section->is_visible,
                'content' => $section->content,
                'styles' => $section->styles,
                'settings' => $section->settings,
            ]);
        }

        // Duplicate FAQs
        foreach ($sourceTenant->faqs()->get() as $faq) {
            $newTenant->faqs()->create([
                'question' => $faq->question,
                'answer' => $faq->answer,
                'category' => $faq->category,
                'order' => $faq->order,
                'is_published' => $faq->is_published,
            ]);
        }

        // Duplicate Testimonials
        foreach ($sourceTenant->testimonials()->get() as $testimonial) {
            $newTenant->testimonials()->create([
                'author_name' => $testimonial->author_name,
                'author_title' => $testimonial->author_title,
                'author_image' => $testimonial->author_image,
                'content' => $testimonial->content,
                'rating' => $testimonial->rating,
                'is_featured' => $testimonial->is_featured,
                'is_published' => $testimonial->is_published,
                'order' => $testimonial->order,
            ]);
        }

        // Duplicate Team Members
        foreach ($sourceTenant->teamMembers()->get() as $member) {
            $newTenant->teamMembers()->create([
                'name' => $member->name,
                'title' => $member->title,
                'bio' => $member->bio,
                'image' => $member->image,
                'credentials' => $member->credentials,
                'social_links' => $member->social_links,
                'order' => $member->order,
                'is_published' => $member->is_published,
            ]);
        }

        // Duplicate Menus
        foreach ($sourceTenant->menus()->get() as $menu) {
            $newTenant->menus()->create([
                'name' => $menu->name,
                'location' => $menu->location,
                'items' => $menu->items,
                'is_active' => $menu->is_active,
            ]);
        }

        return $newTenant->load('activeTemplate');
    }
}
