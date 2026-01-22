<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Handle an incoming request.
     * 
     * Tenant Resolution Priority:
     * 1. X-Tenant-ID header (slug or ID) - for API clients
     * 2. X-Forwarded-Host header (domain) - for production behind proxy/CDN
     * 3. Origin header (domain) - for CORS requests
     * 4. Host header (domain) - direct domain access
     * 5. tenant_id query parameter - fallback for testing
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found. Please provide X-Tenant-ID header, valid domain, or tenant_id query parameter.',
                'debug' => config('app.debug') ? [
                    'checked_header' => $request->header('X-Tenant-ID'),
                    'checked_domain' => $this->extractDomain($request),
                    'checked_query' => $request->query('tenant_id'),
                ] : null,
            ], 400);
        }

        // Store tenant in request for later use
        $request->attributes->set('tenant', $tenant);
        $request->attributes->set('tenant_id', $tenant->id);

        // Set tenant context for models using BelongsToTenant trait
        app()->instance('current_tenant', $tenant);

        return $next($request);
    }

    /**
     * Resolve tenant from request using multiple strategies.
     */
    protected function resolveTenant(Request $request): ?Tenant
    {
        // Strategy 1: X-Tenant-ID header (highest priority - explicit)
        $tenantId = $request->header('X-Tenant-ID');
        if ($tenantId) {
            $tenant = $this->findTenantByIdOrSlug($tenantId);
            if ($tenant) {
                return $tenant;
            }
        }

        // Strategy 2: Domain-based resolution
        $domain = $this->extractDomain($request);
        if ($domain) {
            $tenant = $this->findTenantByDomain($domain);
            if ($tenant) {
                return $tenant;
            }
        }

        // Strategy 3: Query parameter fallback (for testing)
        $tenantId = $request->query('tenant_id');
        if ($tenantId) {
            return $this->findTenantByIdOrSlug($tenantId);
        }

        return null;
    }

    /**
     * Extract domain from request headers.
     * Handles various header scenarios (proxy, CDN, direct).
     */
    protected function extractDomain(Request $request): ?string
    {
        // Priority 1: X-Forwarded-Host (behind proxy/CDN like Cloudflare)
        $domain = $request->header('X-Forwarded-Host');
        if ($domain) {
            return $this->cleanDomain($domain);
        }

        // Priority 2: Origin header (CORS requests from frontend)
        $origin = $request->header('Origin');
        if ($origin) {
            $parsed = parse_url($origin);
            if (isset($parsed['host'])) {
                return $this->cleanDomain($parsed['host']);
            }
        }

        // Priority 3: Host header (direct access)
        $host = $request->getHost();
        if ($host) {
            return $this->cleanDomain($host);
        }

        return null;
    }

    /**
     * Clean domain string (remove port, www prefix, etc.)
     */
    protected function cleanDomain(string $domain): string
    {
        // Remove port if present
        $domain = preg_replace('/:\d+$/', '', $domain);
        
        // Optionally remove www prefix for matching
        // Uncomment if you want www.example.com to match example.com
        // $domain = preg_replace('/^www\./', '', $domain);
        
        return strtolower(trim($domain));
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
            ->first();
    }

    /**
     * Find tenant by domain.
     * Supports exact match and wildcard subdomains.
     */
    protected function findTenantByDomain(string $domain): ?Tenant
    {
        // Skip localhost and local development domains without explicit mapping
        $localDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
        if (in_array($domain, $localDomains)) {
            return null; // Let other strategies handle local development
        }

        // Try exact domain match
        $tenant = Tenant::where('is_active', true)
            ->where('domain', $domain)
            ->first();

        if ($tenant) {
            return $tenant;
        }

        // Try matching with wildcard support (e.g., *.hyve.com)
        // Check if domain matches any tenant's subdomain pattern
        $tenants = Tenant::where('is_active', true)
            ->whereNotNull('domain')
            ->get();

        foreach ($tenants as $tenant) {
            // Support subdomain matching: tenant.domain matches *.domain pattern
            if ($this->domainMatches($domain, $tenant->domain)) {
                return $tenant;
            }
        }

        // Try matching by slug as subdomain (e.g., hyve-wellness.localhost:3000)
        // This is useful for local testing with custom domains
        $parts = explode('.', $domain);
        if (count($parts) >= 2) {
            $potentialSlug = $parts[0];
            $tenant = Tenant::where('is_active', true)
                ->where('slug', $potentialSlug)
                ->first();
            if ($tenant) {
                return $tenant;
            }
        }

        return null;
    }

    /**
     * Check if a domain matches a pattern (supports wildcards).
     */
    protected function domainMatches(string $domain, string $pattern): bool
    {
        // Exact match
        if ($domain === $pattern) {
            return true;
        }

        // Wildcard match (*.example.com matches sub.example.com)
        if (str_starts_with($pattern, '*.')) {
            $baseDomain = substr($pattern, 2);
            return str_ends_with($domain, '.' . $baseDomain) || $domain === $baseDomain;
        }

        return false;
    }
}
