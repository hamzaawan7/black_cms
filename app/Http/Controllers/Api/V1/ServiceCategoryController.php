<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\ServiceCategoryResource;
use App\Http\Resources\ServiceCategoryCollection;
use App\Services\ServiceCategoryService;

class ServiceCategoryController extends BaseApiController
{
    public function __construct(protected ServiceCategoryService $categoryService)
    {
    }

    /**
     * Get all categories.
     */
    public function index()
    {
        $categories = $this->categoryService->getAll(['is_active' => true]);

        return $this->successResponse(
            new ServiceCategoryCollection($categories),
            'Categories retrieved successfully'
        );
    }

    /**
     * Get a single category by slug with its services.
     */
    public function show(string $slug)
    {
        $category = $this->categoryService->getBySlug($slug);

        if (!$category) {
            return $this->notFoundResponse('Category not found');
        }

        return $this->successResponse(
            new ServiceCategoryResource($category),
            'Category retrieved successfully'
        );
    }
}
