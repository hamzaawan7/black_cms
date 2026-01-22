<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ConfigController extends Controller
{
    /**
     * Get site configuration for a tenant.
     */
    public function index(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:config";

        $config = Cache::remember($cacheKey, 3600, function () use ($tenant) {
            $settings = $tenant->settings()
                ->get()
                ->groupBy('group')
                ->map(function ($group) {
                    return $group->pluck('value', 'key');
                });

            $menus = $tenant->menus()
                ->active()
                ->get()
                ->keyBy('location')
                ->map(function ($menu) {
                    return $menu->items;
                });

            return [
                'tenant' => [
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'logo' => $tenant->logo,
                    'favicon' => $tenant->favicon,
                ],
                'template' => $tenant->activeTemplate ? [
                    'name' => $tenant->activeTemplate->name,
                    'slug' => $tenant->activeTemplate->slug,
                    'version' => $tenant->activeTemplate->version,
                ] : null,
                'settings' => $settings,
                'menus' => $menus,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $config,
        ]);
    }

    /**
     * Get tenant by slug.
     */
    private function getTenant(string $slug): ?Tenant
    {
        return Cache::remember("tenant:slug:{$slug}", 3600, function () use ($slug) {
            return Tenant::where('slug', $slug)
                ->where('is_active', true)
                ->with('activeTemplate')
                ->first();
        });
    }
}
