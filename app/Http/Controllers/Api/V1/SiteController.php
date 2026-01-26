<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Services\TenantService;
use App\Services\SettingService;
use Illuminate\Http\Request;

class SiteController extends BaseApiController
{
    public function __construct(
        protected TenantService $tenantService,
        protected SettingService $settingService
    ) {
    }

    /**
     * Get complete site configuration for frontend.
     * This is the main endpoint that frontend templates will call on initialization.
     */
    public function config()
    {
        $tenantId = request()->header('X-Tenant-ID') ?? request()->get('tenant_id');

        if (!$tenantId) {
            return $this->errorResponse('Tenant ID is required', 400);
        }

        $tenant = $this->tenantService->getById($tenantId);

        if (!$tenant || !$tenant->is_active) {
            return $this->notFoundResponse('Site not found or inactive');
        }

        // Get settings
        $settings = $this->settingService->getAllAsArray();

        return $this->successResponse([
            'tenant' => new TenantResource($tenant),
            'settings' => $settings,
        ], 'Site configuration retrieved successfully');
    }

    /**
     * Get site by domain.
     * Supports exact domain match and slug-based subdomain matching.
     * 
     * Examples:
     * - wellness.hyve.com -> matches tenant with domain "wellness.hyve.com"
     * - hyve-wellness.localhost -> matches tenant with slug "hyve-wellness"
     */
    public function byDomain(string $domain)
    {
        // Clean the domain
        $domain = $this->cleanDomain($domain);
        
        // Strategy 1: Exact domain match
        $tenant = $this->tenantService->getByDomain($domain);

        // Strategy 2: Try slug-based subdomain matching (e.g., hyve-wellness.localhost)
        if (!$tenant) {
            $parts = explode('.', $domain);
            if (count($parts) >= 2) {
                $potentialSlug = $parts[0];
                $tenant = $this->tenantService->getBySlug($potentialSlug);
            }
        }

        if (!$tenant) {
            return $this->notFoundResponse('Site not found for this domain');
        }

        return $this->successResponse(
            new TenantResource($tenant),
            'Site retrieved successfully'
        );
    }

    /**
     * Resolve tenant from the current request.
     * Useful for frontend to auto-detect which tenant it should use.
     */
    public function resolve(Request $request)
    {
        // Check various sources for tenant identification
        $sources = [
            'header' => $request->header('X-Tenant-ID'),
            'origin' => $this->extractDomainFromOrigin($request->header('Origin')),
            'forwarded_host' => $request->header('X-Forwarded-Host'),
            'host' => $request->getHost(),
            'query' => $request->query('tenant_id'),
        ];

        $tenant = null;
        $resolvedVia = null;

        // Try each source in priority order
        if ($sources['header']) {
            $tenant = $this->findTenantByIdOrSlug($sources['header']);
            if ($tenant) $resolvedVia = 'X-Tenant-ID header';
        }

        if (!$tenant && $sources['forwarded_host']) {
            $tenant = $this->resolveTenantByDomain($this->cleanDomain($sources['forwarded_host']));
            if ($tenant) $resolvedVia = 'X-Forwarded-Host header';
        }

        if (!$tenant && $sources['origin']) {
            $tenant = $this->resolveTenantByDomain($sources['origin']);
            if ($tenant) $resolvedVia = 'Origin header';
        }

        if (!$tenant && $sources['host']) {
            $tenant = $this->resolveTenantByDomain($this->cleanDomain($sources['host']));
            if ($tenant) $resolvedVia = 'Host header';
        }

        if (!$tenant && $sources['query']) {
            $tenant = $this->findTenantByIdOrSlug($sources['query']);
            if ($tenant) $resolvedVia = 'Query parameter';
        }

        if (!$tenant) {
            return $this->errorResponse('Could not resolve tenant from request', 400, [
                'sources_checked' => array_filter($sources),
                'suggestion' => 'Provide X-Tenant-ID header or configure domain mapping',
            ]);
        }

        return $this->successResponse([
            'tenant' => new TenantResource($tenant),
            'resolved_via' => $resolvedVia,
            'slug' => $tenant->slug,
        ], 'Tenant resolved successfully');
    }

    /**
     * Health check endpoint.
     */
    public function health()
    {
        return $this->successResponse([
            'status' => 'healthy',
            'version' => config('app.version', '1.0.0'),
            'timestamp' => now()->toIso8601String(),
        ], 'API is healthy');
    }

    /**
     * Clean domain string.
     */
    protected function cleanDomain(string $domain): string
    {
        $domain = preg_replace('/:\d+$/', '', $domain);
        return strtolower(trim($domain));
    }

    /**
     * Extract domain from Origin header URL.
     */
    protected function extractDomainFromOrigin(?string $origin): ?string
    {
        if (!$origin) return null;
        
        $parsed = parse_url($origin);
        if (isset($parsed['host'])) {
            return $this->cleanDomain($parsed['host']);
        }
        return null;
    }

    /**
     * Find tenant by ID or slug.
     */
    protected function findTenantByIdOrSlug(string $identifier): ?Tenant
    {
        return Tenant::where('is_active', true)
            ->where(function ($query) use ($identifier) {
                $query->where('id', $identifier)
                    ->orWhere('slug', $identifier);
            })
            ->with('activeTemplate')
            ->first();
    }

    /**
     * Resolve tenant by domain with multiple strategies.
     */
    protected function resolveTenantByDomain(string $domain): ?Tenant
    {
        // Skip localhost variants
        $localDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
        if (in_array($domain, $localDomains)) {
            return null;
        }

        // Use Tenant's findByDomain which checks primary and additional domains
        $tenant = Tenant::findByDomain($domain);
        if ($tenant && $tenant->is_active) {
            return $tenant->load('activeTemplate');
        }

        // Try slug-based subdomain matching
        $parts = explode('.', $domain);
        if (count($parts) >= 2) {
            $potentialSlug = $parts[0];
            $tenant = Tenant::where('is_active', true)
                ->where('slug', $potentialSlug)
                ->with('activeTemplate')
                ->first();
        }

        return $tenant;
    }

    /**
     * Duplicate content from main tenant (ID: 1) to a target tenant.
     * This is a utility endpoint for setting up new tenants with starter content.
     * 
     * POST /api/v1/site/duplicate-content/{tenantId}
     */
    public function duplicateContent(int $tenantId)
    {
        $sourceTenant = Tenant::find(1);
        $targetTenant = Tenant::find($tenantId);

        if (!$sourceTenant) {
            return $this->errorResponse('Source tenant (ID: 1) not found', 404);
        }

        if (!$targetTenant) {
            return $this->errorResponse('Target tenant not found', 404);
        }

        if ($tenantId === 1) {
            return $this->errorResponse('Cannot duplicate to main tenant itself', 400);
        }

        try {
            $results = [];

            // Duplicate Service Categories
            $categoryMapping = [];
            $categoriesCount = 0;
            foreach ($sourceTenant->serviceCategories()->get() as $category) {
                $existing = $targetTenant->serviceCategories()->where('slug', $category->slug)->first();
                if (!$existing) {
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
                } else {
                    $categoryMapping[$category->id] = $existing->id;
                }
            }
            $results['categories'] = $categoriesCount;

            // Duplicate Services
            $servicesCount = 0;
            foreach ($sourceTenant->services()->get() as $service) {
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
            $results['services'] = $servicesCount;

            // Duplicate Pages
            $pageMapping = [];
            $pagesCount = 0;
            foreach ($sourceTenant->pages()->get() as $page) {
                $existing = $targetTenant->pages()->where('slug', $page->slug)->first();
                if (!$existing) {
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
                } else {
                    $pageMapping[$page->id] = $existing->id;
                }
            }
            $results['pages'] = $pagesCount;

            // Duplicate Sections
            $sectionsCount = 0;
            $sourceSections = \App\Models\Section::where('tenant_id', 1)->get();
            foreach ($sourceSections as $section) {
                $newPageId = $pageMapping[$section->page_id] ?? null;
                if ($newPageId && !\App\Models\Section::where('tenant_id', $tenantId)->where('page_id', $newPageId)->where('type', $section->type)->exists()) {
                    \App\Models\Section::create([
                        'tenant_id' => $tenantId,
                        'page_id' => $newPageId,
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
            $results['sections'] = $sectionsCount;

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
            $results['menus'] = $menusCount;

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
            $results['team_members'] = $teamCount;

            return $this->successResponse([
                'tenant_id' => $tenantId,
                'tenant_name' => $targetTenant->name,
                'duplicated' => $results,
            ], 'Content duplicated successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to duplicate content: ' . $e->getMessage(), 500);
        }
    }
}
