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
}
