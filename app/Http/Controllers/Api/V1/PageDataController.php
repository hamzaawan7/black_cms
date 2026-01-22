<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class PageDataController extends Controller
{
    /**
     * Get complete page data for a single API call.
     * This is the optimized endpoint that returns everything needed to render a page.
     */
    public function show(string $tenantSlug, string $pageSlug = 'home'): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:page-data:{$pageSlug}";

        $data = Cache::remember($cacheKey, 3600, function () use ($tenant, $pageSlug) {
            $page = Page::where('tenant_id', $tenant->id)
                ->where('slug', $pageSlug)
                ->where('is_published', true)
                ->with(['sections' => function ($query) {
                    $query->where('is_visible', true)->orderBy('order');
                }])
                ->first();

            if (!$page) {
                return null;
            }

            // Get settings
            $settings = $tenant->settings()
                ->get()
                ->groupBy('group')
                ->map(function ($group) {
                    return $group->pluck('value', 'key');
                });

            // Get menus
            $menus = $tenant->menus()
                ->active()
                ->get()
                ->keyBy('location')
                ->map(function ($menu) {
                    return $menu->items;
                });

            return [
                'page' => [
                    'slug' => $page->slug,
                    'title' => $page->title,
                    'meta' => [
                        'title' => $page->meta_title ?? $page->title,
                        'description' => $page->meta_description,
                        'keywords' => $page->meta_keywords,
                        'og_image' => $page->og_image,
                    ],
                ],
                'sections' => $page->sections->map(function ($section) {
                    return [
                        'id' => $section->id,
                        'component' => $section->component_type,
                        'order' => $section->order,
                        'visible' => $section->is_visible,
                        'content' => $section->content,
                        'styles' => $section->styles,
                        'settings' => $section->settings,
                    ];
                }),
                'settings' => $settings,
                'menus' => $menus,
                'tenant' => [
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'logo' => $tenant->logo,
                    'favicon' => $tenant->favicon,
                ],
            ];
        });

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
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
                ->first();
        });
    }
}
