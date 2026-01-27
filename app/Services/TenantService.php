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
     * 
     * VPS/NGINX APPROACH:
     * - Creates tenant record in database
     * - Generates NGINX config file for the domain
     * - NGINX config points to tenant's template directory
     * - Client points DNS A record to VPS IP
     * - Domain resolves to correct tenant content
     * - Tenant admin can manage isolated content
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

        $tenant = Tenant::create($data);

        // Generate API key for the tenant
        $tenant->regenerateApiKey();

        // Process domain and generate NGINX config
        if (!empty($data['domain'])) {
            $cleanDomain = preg_replace('#^https?://#', '', $data['domain']);
            $cleanDomain = rtrim($cleanDomain, '/');
            
            // Get deployment path for this tenant
            $deploymentPath = $this->deploymentService->getDeploymentPath($tenant);
            
            // Generate NGINX configuration file
            $nginxResult = $this->nginxService->generateConfig($tenant, $cleanDomain, $deploymentPath);
            
            // Update tenant with NGINX config info
            $tenant->update([
                'domain' => $cleanDomain,
                'frontend_url' => "https://{$cleanDomain}",
                'nginx_config_path' => $nginxResult['config_path'] ?? null,
                'nginx_config_file' => $nginxResult['config_file'] ?? null,
                'nginx_status' => $nginxResult['success'] ? 'configured' : 'failed',
                'deployment_status' => 'pending_dns', // Waiting for client to point DNS to VPS
            ]);

            // Log DNS instructions for admin
            $serverIp = config('app.server_ip', 'YOUR_VPS_IP');
            \Log::info("Tenant {$tenant->id} created. NGINX configured. DNS Setup Required:", [
                'domain' => $cleanDomain,
                'nginx_config' => $nginxResult['config_path'] ?? 'N/A',
                'action' => "Point {$cleanDomain} A record to {$serverIp}",
            ]);
        }

        // If template is assigned, trigger full deployment (copies template files + NGINX for all domains)
        if ($tenant->active_template_id && $tenant->activeTemplate) {
            $this->deploymentService->deployTemplate($tenant, $tenant->activeTemplate);
        }

        // Note: Content duplication happens when user is assigned to tenant (in UserService)
        // This prevents duplicate data if tenant is created but no user assigned yet

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
            // Duplicate Settings (check if already exists)
            foreach ($mainTenant->tenantSettings()->get() as $setting) {
                if (!$newTenant->tenantSettings()->where('key', $setting->key)->where('group', $setting->group)->exists()) {
                    $newTenant->tenantSettings()->create([
                        'group' => $setting->group,
                        'key' => $setting->key,
                        'value' => $setting->value,
                    ]);
                }
            }

            // Duplicate Service Categories first (needed for services)
            $categoryMapping = [];
            foreach ($mainTenant->serviceCategories()->get() as $category) {
                // Check if category already exists
                $existing = $newTenant->serviceCategories()->where('slug', $category->slug)->first();
                if ($existing) {
                    $categoryMapping[$category->id] = $existing->id;
                    continue;
                }
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
                // Skip if service already exists
                if ($newTenant->services()->where('slug', $service->slug)->exists()) {
                    continue;
                }
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
                // Check if page already exists
                $existingPage = $newTenant->pages()->where('slug', $page->slug)->first();
                if ($existingPage) {
                    $pageMapping[$page->id] = $existingPage->id;
                    continue;
                }
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

            // Duplicate FAQs
            foreach ($mainTenant->faqs()->get() as $faq) {
                // Skip if FAQ already exists
                if ($newTenant->faqs()->where('question', $faq->question)->exists()) {
                    continue;
                }
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
                // Skip if testimonial already exists
                if ($newTenant->testimonials()->where('author_name', $testimonial->author_name)->where('content', $testimonial->content)->exists()) {
                    continue;
                }
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
                // Skip if team member already exists
                if ($newTenant->teamMembers()->where('name', $member->name)->exists()) {
                    continue;
                }
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
                // Skip if menu already exists
                if ($newTenant->menus()->where('location', $menu->location)->exists()) {
                    continue;
                }
                $newTenant->menus()->create([
                    'name' => $menu->name,
                    'location' => $menu->location,
                    'items' => $menu->items,
                    'is_active' => $menu->is_active,
                ]);
            }

            // Duplicate Sections with page mapping
            foreach ($mainTenant->sections()->get() as $section) {
                $newPageId = $pageMapping[$section->page_id] ?? null;
                // Skip if section already exists for this page with same component_type
                if ($newPageId && $newTenant->sections()->where('page_id', $newPageId)->where('component_type', $section->component_type)->exists()) {
                    continue;
                }
                $newTenant->sections()->create([
                    'page_id' => $newPageId,
                    'component_type' => $section->component_type,
                    'type' => $section->type,
                    'order' => $section->order,
                    'is_visible' => $section->is_visible,
                    'content' => $section->content,
                    'styles' => $section->styles,
                    'settings' => $section->settings,
                ]);
            }

            \Log::info("Successfully duplicated content from main tenant to tenant {$newTenant->id} ({$newTenant->name})");

            // Copy frontend files to new tenant's domain
            if ($newTenant->domain) {
                $this->copyFrontendFiles($newTenant);
            }
        } catch (\Exception $e) {
            \Log::error("Failed to duplicate content from main tenant to tenant {$newTenant->id}: " . $e->getMessage());
            throw $e;
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
     * Verify DNS setup for a tenant domain.
     * 
     * VPS/NGINX APPROACH:
     * - Check if domain A record points to VPS IP
     * - If yes, mark DNS verified and trigger SSL generation
     */
    public function verifyDomainSetup(Tenant $tenant): array
    {
        if (!$tenant->domain) {
            return ['success' => false, 'message' => 'No domain configured for this tenant'];
        }

        $cleanDomain = preg_replace('#^https?://#', '', $tenant->domain);
        $cleanDomain = rtrim($cleanDomain, '/');

        // Get expected VPS IP from config
        $vpsIP = config('app.server_ip');
        
        if (!$vpsIP) {
            return [
                'success' => false,
                'message' => 'VPS_SERVER_IP not configured in .env',
            ];
        }

        // Check DNS A record
        $resolvedIP = @gethostbyname($cleanDomain);
        $domainResolves = ($resolvedIP !== $cleanDomain);

        $dnsInfo = [
            'domain' => $cleanDomain,
            'resolved_ip' => $domainResolves ? $resolvedIP : null,
            'expected_ip' => $vpsIP,
            'match' => ($resolvedIP === $vpsIP),
        ];

        if (!$domainResolves) {
            return [
                'success' => false,
                'status' => 'dns_not_configured',
                'message' => "Domain {$cleanDomain} DNS not configured yet",
                'instructions' => $this->getDNSInstructions($cleanDomain),
                'dns_info' => $dnsInfo,
            ];
        }

        // Check if IP matches VPS IP
        if ($resolvedIP !== $vpsIP) {
            return [
                'success' => false,
                'status' => 'dns_wrong_ip',
                'message' => "Domain points to {$resolvedIP}, expected {$vpsIP}",
                'instructions' => $this->getDNSInstructions($cleanDomain),
                'dns_info' => $dnsInfo,
            ];
        }

        // DNS is pointing correctly! Update tenant
        $tenant->update([
            'dns_verified' => true,
            'dns_verified_at' => now(),
        ]);

        // Try to reach the domain (check if NGINX + SSL working)
        $isHttpsReachable = $this->checkDomainReachable($cleanDomain, true);
        $isHttpReachable = $this->checkDomainReachable($cleanDomain, false);

        if ($isHttpsReachable) {
            // Fully working with SSL!
            $tenant->update([
                'deployment_status' => 'active',
                'ssl_status' => 'active',
            ]);

            return [
                'success' => true,
                'status' => 'active',
                'message' => "Domain {$cleanDomain} is live with SSL!",
                'url' => "https://{$cleanDomain}",
                'dns_info' => $dnsInfo,
            ];
        }

        if ($isHttpReachable) {
            // HTTP works, SSL needed
            $tenant->update([
                'deployment_status' => 'pending_ssl',
                'ssl_status' => 'pending',
            ]);

            return [
                'success' => false,
                'status' => 'pending_ssl',
                'message' => "Domain DNS verified! HTTP works. SSL certificate needed.",
                'ssl_command' => "sudo certbot --nginx -d {$cleanDomain} -d www.{$cleanDomain}",
                'dns_info' => $dnsInfo,
            ];
        }

        // DNS correct but not reachable yet (propagating or NGINX issue)
        $tenant->update([
            'deployment_status' => 'dns_verified',
        ]);

        return [
            'success' => false,
            'status' => 'dns_propagating',
            'message' => "DNS pointing correctly to VPS. Waiting for propagation or check NGINX config.",
            'nginx_check' => "sudo nginx -t && sudo systemctl status nginx",
            'dns_info' => $dnsInfo,
        ];
    }

    /**
     * Check if a domain is reachable via HTTP/HTTPS
     */
    protected function checkDomainReachable(string $domain, bool $https = true): bool
    {
        try {
            $protocol = $https ? 'https' : 'http';
            $ch = curl_init("{$protocol}://{$domain}");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_NOBODY => true, // HEAD request only
            ]);
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return ($httpCode >= 200 && $httpCode < 500);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get DNS setup instructions for a domain (VPS approach).
     */
    protected function getDNSInstructions(string $domain): array
    {
        $serverIP = config('app.server_ip', 'YOUR_VPS_IP');

        return [
            'summary' => "Point {$domain} A record to VPS IP: {$serverIP}",
            'steps' => [
                "1. Login to your domain registrar (GoDaddy/Namecheap/Hostinger/etc)",
                "2. Go to DNS Management / DNS Settings",
                "3. Add or Edit A Record:",
                "   - Type: A",
                "   - Name: @ (or leave blank for root domain)",
                "   - Value: {$serverIP}",
                "   - TTL: 600 (or 1 hour)",
                "4. Add A Record for www:",
                "   - Type: A", 
                "   - Name: www",
                "   - Value: {$serverIP}",
                "   - TTL: 600",
                "5. Save and wait 5-30 minutes for DNS propagation",
                "6. Run: php artisan tenant:verify --pending",
            ],
            'vps_ip' => $serverIP,
        ];
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

        // If domain changed, update frontend URL
        if (isset($data['domain']) && $data['domain'] !== $oldDomain) {
            $cleanDomain = preg_replace('#^https?://#', '', $data['domain']);
            $cleanDomain = rtrim($cleanDomain, '/');
            
            $tenant->update([
                'frontend_url' => "https://{$cleanDomain}",
                'deployment_status' => 'pending_dns',
                'dns_verified' => false,
            ]);
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
        foreach ($sourceTenant->tenantSettings()->get() as $setting) {
            $newTenant->tenantSettings()->create([
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
