<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceCategory\StoreServiceCategoryRequest;
use App\Http\Requests\ServiceCategory\UpdateServiceCategoryRequest;
use App\Http\Resources\ServiceCategoryResource;
use App\Models\ServiceCategory;
use App\Services\ServiceCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceCategoryController extends Controller
{
    public function __construct(protected ServiceCategoryService $categoryService)
    {
    }

    /**
     * Display a listing of the categories.
     */
    public function index(): Response
    {
        $categories = $this->categoryService->getAll();

        return Inertia::render('Admin/ServiceCategories/Index', [
            'categories' => ServiceCategoryResource::collection($categories),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/ServiceCategories/Create');
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreServiceCategoryRequest $request): RedirectResponse
    {
        $category = $this->categoryService->create($request->validated());

        return redirect()
            ->route('admin.service-categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Show the form for editing the category.
     */
    public function edit(ServiceCategory $serviceCategory): Response
    {
        return Inertia::render('Admin/ServiceCategories/Edit', [
            'category' => new ServiceCategoryResource($serviceCategory),
        ]);
    }

    /**
     * Update the category.
     */
    public function update(UpdateServiceCategoryRequest $request, ServiceCategory $serviceCategory): RedirectResponse
    {
        $this->categoryService->update($serviceCategory, $request->validated());

        return redirect()
            ->route('admin.service-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the category.
     */
    public function destroy(ServiceCategory $serviceCategory): RedirectResponse
    {
        try {
            $this->categoryService->delete($serviceCategory);
            return redirect()
                ->route('admin.service-categories.index')
                ->with('success', 'Category deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Reorder categories.
     */
    public function reorder(): RedirectResponse
    {
        $this->categoryService->reorder(request('orders', []));

        return back()->with('success', 'Categories reordered successfully.');
    }

    /**
     * Get categories with their services for the SectionBuilder.
     */
    public function getCategoriesWithServices(): JsonResponse
    {
        $categories = ServiceCategory::with(['services' => function($query) {
            $query->where('is_published', true)
                  ->orderBy('order')
                  ->select('id', 'category_id', 'name', 'slug', 'description', 'headline', 'pricing', 'image', 'is_popular', 'is_published');
        }])
        ->where('is_active', true)
        ->orderBy('order')
        ->get(['id', 'name', 'slug', 'description', 'image', 'order', 'is_active']);

        return response()->json([
            'data' => $categories,
        ]);
    }
}
