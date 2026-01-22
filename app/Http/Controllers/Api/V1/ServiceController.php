<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\ServiceCollection;
use App\Models\ServiceCategory;
use App\Models\Tenant;
use App\Services\ServiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ServiceController extends BaseApiController
{
    public function __construct(protected ServiceService $serviceService)
    {
    }

    /**
     * Get all services.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['is_published', 'is_popular', 'category_id']);
        $filters['is_published'] = true; // API only returns published

        $services = $this->serviceService->getAll($filters);

        return $this->successResponse(
            new ServiceCollection($services),
            'Services retrieved successfully'
        );
    }

    /**
     * Get a single service by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $service = $this->serviceService->getBySlug($slug);

        if (!$service) {
            return $this->notFoundResponse('Service not found');
        }

        return $this->successResponse(
            new ServiceResource($service),
            'Service retrieved successfully'
        );
    }

    /**
     * Get popular services.
     */
    public function popular(): JsonResponse
    {
        $limit = request()->get('limit', 6);
        $services = $this->serviceService->getPopular($limit);

        return $this->successResponse(
            new ServiceCollection($services),
            'Popular services retrieved successfully'
        );
    }

    /**
     * Get services by category.
     */
    public function byCategory(int $categoryId): JsonResponse
    {
        $services = $this->serviceService->getByCategory($categoryId);

        return $this->successResponse(
            new ServiceCollection($services),
            'Services retrieved successfully'
        );
    }

    // ==========================================
    // LEGACY METHODS (for backward compatibility)
    // ==========================================

    /**
     * Get all services grouped by category (Legacy).
     */
    public function legacyIndex(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:services";

        $data = Cache::remember($cacheKey, 3600, function () use ($tenant) {
            return ServiceCategory::where('tenant_id', $tenant->id)
                ->where('is_active', true)
                ->with(['services' => function ($query) {
                    $query->where('is_published', true)->orderBy('order');
                }])
                ->orderBy('order')
                ->get()
                ->map(function ($category) {
                    return [
                        'category' => $category->name,
                        'slug' => $category->slug,
                        'image' => $category->image,
                        'items' => $category->services->map(function ($service) {
                            return [
                                'slug' => $service->slug,
                                'name' => $service->name,
                                'description' => $service->description,
                                'headline' => $service->headline,
                                'pricing' => $service->pricing,
                                'image' => $service->image,
                                'popular' => $service->is_popular,
                            ];
                        }),
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get a single service by slug (Legacy).
     */
    public function legacyShow(string $tenantSlug, string $serviceSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:service:{$serviceSlug}";

        $service = Cache::remember($cacheKey, 3600, function () use ($tenant, $serviceSlug) {
            return $tenant->services()
                ->where('slug', $serviceSlug)
                ->where('is_published', true)
                ->with('category')
                ->first();
        });

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'slug' => $service->slug,
                'name' => $service->name,
                'category' => $service->category->name,
                'categorySlug' => $service->category->slug,
                'description' => $service->description,
                'headline' => $service->headline,
                'pricing' => $service->pricing,
                'image' => $service->image,
                'secondaryImage' => $service->secondary_image,
                'vialImage' => $service->vial_image,
                'popular' => $service->is_popular,
                'content' => $service->content,
                'stats' => $service->stats,
                'benefits' => $service->benefits,
                'whatIs' => $service->what_is,
            ],
        ]);
    }

    /**
     * Get categories list (Legacy).
     */
    public function legacyCategories(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $categories = ServiceCategory::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'image' => $category->image,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get tenant by slug.
     */
    protected function getTenant(string $slug): ?Tenant
    {
        return Tenant::where('slug', $slug)->where('is_active', true)->first();
    }
}
