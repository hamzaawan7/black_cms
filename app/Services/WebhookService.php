<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Webhook;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;

class WebhookService
{
    /**
     * Cache key prefixes by resource type.
     */
    protected array $cacheKeyPrefixes = [
        'pages' => ['page:', 'pages:'],
        'services' => ['service:', 'services:', 'category:'],
        'settings' => ['settings:', 'setting:'],
        'menus' => ['menu:', 'menus:'],
        'team' => ['team:', 'team_member:'],
        'faqs' => ['faq:', 'faqs:'],
        'testimonials' => ['testimonial:', 'testimonials:'],
        'templates' => ['template:', 'templates:'],
    ];

    /**
     * Frontend URLs for revalidation by resource type.
     */
    protected array $frontendPaths = [
        'pages' => ['/', '/about', '/contact', '/services', '/partners'],
        'services' => ['/services', '/'],
        'settings' => ['/', '/about', '/contact', '/services'],
        'menus' => ['/', '/about', '/contact', '/services'],
        'team' => ['/about', '/'],
        'faqs' => ['/', '/about'],
        'testimonials' => ['/', '/about'],
    ];

    /**
     * Clear cache for a specific resource type.
     */
    public function clearCache(string $type, ?int $tenantId = null, ?string $slug = null): array
    {
        $cleared = [];

        if ($type === 'all') {
            // Clear all cache for tenant
            foreach ($this->cacheKeyPrefixes as $resourceType => $prefixes) {
                foreach ($prefixes as $prefix) {
                    $key = $tenantId ? "tenant:{$tenantId}:{$prefix}" : $prefix;
                    Cache::forget($key . '*');
                    $cleared[] = $key;
                }
            }
            
            // Also clear specific tenant cache
            if ($tenantId) {
                Cache::forget("tenant:{$tenantId}:template");
                Cache::forget("tenant:slug:*");
                $cleared[] = "tenant:{$tenantId}:*";
            }
        } else {
            // Clear specific resource type cache
            $prefixes = $this->cacheKeyPrefixes[$type] ?? [];
            
            foreach ($prefixes as $prefix) {
                if ($slug) {
                    $key = $tenantId 
                        ? "tenant:{$tenantId}:{$prefix}{$slug}"
                        : "{$prefix}{$slug}";
                    Cache::forget($key);
                    $cleared[] = $key;
                } else {
                    // Clear all of this type
                    $key = $tenantId ? "tenant:{$tenantId}:{$prefix}" : $prefix;
                    // Note: Pattern-based clearing depends on cache driver
                    Cache::forget($key . 'list');
                    Cache::forget($key . 'all');
                    $cleared[] = $key . '*';
                }
            }
        }

        Log::info('Cache cleared', [
            'type' => $type,
            'tenant_id' => $tenantId,
            'slug' => $slug,
            'cleared' => $cleared,
        ]);

        return $cleared;
    }

    /**
     * Trigger frontend revalidation.
     */
    public function revalidateFrontend(?Tenant $tenant, array $paths): array
    {
        $results = [];
        $frontendUrl = $this->getFrontendUrl($tenant);

        if (!$frontendUrl) {
            return ['error' => 'No frontend URL configured'];
        }

        foreach ($paths as $path) {
            try {
                $response = Http::timeout(5)->post("{$frontendUrl}/api/revalidate", [
                    'path' => $path,
                    'secret' => config('services.frontend.revalidate_secret', env('FRONTEND_REVALIDATE_SECRET')),
                ]);

                $results[$path] = [
                    'success' => $response->successful(),
                    'status' => $response->status(),
                ];
            } catch (\Exception $e) {
                $results[$path] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Handle content change (clear cache + revalidate).
     */
    public function handleContentChange(
        ?Tenant $tenant,
        string $resourceType,
        ?int $resourceId,
        ?string $resourceSlug,
        string $action
    ): array {
        $tenantId = $tenant?->id;

        // Clear relevant cache
        $cleared = $this->clearCache($resourceType, $tenantId, $resourceSlug);

        // Determine paths to revalidate
        $paths = $this->frontendPaths[$resourceType] ?? ['/'];
        
        // Add specific path if slug provided
        if ($resourceSlug && $resourceType === 'pages') {
            $paths[] = "/{$resourceSlug}";
        }
        if ($resourceSlug && $resourceType === 'services') {
            $paths[] = "/services/{$resourceSlug}";
        }

        $paths = array_unique($paths);

        // Trigger revalidation
        $revalidated = $this->revalidateFrontend($tenant, $paths);

        // Fire webhooks
        $webhookResults = $this->fireWebhooks($tenant, "{$resourceType}.{$action}", [
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'resource_slug' => $resourceSlug,
            'action' => $action,
            'tenant_id' => $tenantId,
        ]);

        return [
            'cache_cleared' => $cleared,
            'revalidated' => $revalidated,
            'webhooks_fired' => count($webhookResults),
        ];
    }

    /**
     * Register a webhook.
     */
    public function registerWebhook(
        ?Tenant $tenant,
        string $url,
        array $events,
        ?string $secret = null
    ): array {
        $webhook = Webhook::create([
            'tenant_id' => $tenant?->id,
            'url' => $url,
            'events' => $events,
            'secret' => $secret ?? bin2hex(random_bytes(16)),
            'is_active' => true,
        ]);

        return [
            'id' => $webhook->id,
            'url' => $webhook->url,
            'events' => $webhook->events,
            'created_at' => $webhook->created_at->toIso8601String(),
        ];
    }

    /**
     * Get webhooks for a tenant.
     */
    public function getWebhooks(?Tenant $tenant): Collection
    {
        $query = Webhook::query();

        if ($tenant) {
            $query->where('tenant_id', $tenant->id);
        }

        return $query->get(['id', 'url', 'events', 'is_active', 'last_triggered_at', 'created_at']);
    }

    /**
     * Delete a webhook.
     */
    public function deleteWebhook(?Tenant $tenant, int $id): bool
    {
        $webhook = Webhook::where('id', $id);

        if ($tenant) {
            $webhook->where('tenant_id', $tenant->id);
        }

        return $webhook->delete() > 0;
    }

    /**
     * Fire registered webhooks for an event.
     */
    public function fireWebhooks(?Tenant $tenant, string $event, array $payload): array
    {
        $results = [];

        $webhooks = Webhook::where('is_active', true)
            ->where(function ($q) use ($tenant) {
                $q->whereNull('tenant_id');
                if ($tenant) {
                    $q->orWhere('tenant_id', $tenant->id);
                }
            })
            ->get();

        foreach ($webhooks as $webhook) {
            // Check if webhook is subscribed to this event
            if (!in_array($event, $webhook->events) && !in_array('*', $webhook->events)) {
                continue;
            }

            try {
                $signature = hash_hmac('sha256', json_encode($payload), $webhook->secret);

                $response = Http::timeout(10)
                    ->withHeaders([
                        'X-Webhook-Signature' => $signature,
                        'X-Webhook-Event' => $event,
                        'Content-Type' => 'application/json',
                    ])
                    ->post($webhook->url, $payload);

                $webhook->update([
                    'last_triggered_at' => now(),
                    'last_response_code' => $response->status(),
                ]);

                $results[] = [
                    'webhook_id' => $webhook->id,
                    'success' => $response->successful(),
                    'status' => $response->status(),
                ];
            } catch (\Exception $e) {
                Log::error('Webhook failed', [
                    'webhook_id' => $webhook->id,
                    'url' => $webhook->url,
                    'error' => $e->getMessage(),
                ]);

                $results[] = [
                    'webhook_id' => $webhook->id,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Get cache statistics.
     */
    public function getCacheStats(?Tenant $tenant): array
    {
        // This is a simplified implementation
        // In production, use Redis INFO or similar for detailed stats
        return [
            'driver' => config('cache.default'),
            'prefix' => config('cache.prefix'),
            'tenant_id' => $tenant?->id,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Get frontend URL for a tenant.
     */
    protected function getFrontendUrl(?Tenant $tenant): ?string
    {
        // Check tenant-specific frontend URL
        if ($tenant && $tenant->domain) {
            return "https://{$tenant->domain}";
        }

        // Fall back to environment variable
        return env('FRONTEND_URL', 'http://localhost:3000');
    }
}
