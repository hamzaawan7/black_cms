<?php

namespace App\Services;

use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceCategoryService
{
    /**
     * Get all categories.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = ServiceCategory::with(['services' => function ($query) {
            $query->where('is_published', true)
                  ->select('id', 'name', 'slug', 'is_popular', 'category_id', 'order')
                  ->orderBy('order');
        }])->withCount('services');

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('order')->get();
    }

    /**
     * Get a category by ID.
     */
    public function getById(int $id): ?ServiceCategory
    {
        return ServiceCategory::withCount('services')->find($id);
    }

    /**
     * Get a category by slug with its services.
     */
    public function getBySlug(string $slug): ?ServiceCategory
    {
        return ServiceCategory::with(['services' => function ($query) {
            $query->where('is_published', true)->orderBy('order');
        }])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Create a new category.
     */
    public function create(array $data): ServiceCategory
    {
        // Generate slug if not provided
        if (!isset($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // Set order if not provided
        if (!isset($data['order'])) {
            $maxOrder = ServiceCategory::max('order');
            $data['order'] = ($maxOrder ?? -1) + 1;
        }

        return ServiceCategory::create($data);
    }

    /**
     * Update a category.
     */
    public function update(ServiceCategory $category, array $data): ServiceCategory
    {
        $category->update($data);
        return $category->fresh();
    }

    /**
     * Delete a category.
     */
    public function delete(ServiceCategory $category): bool
    {
        // Check if category has services
        if ($category->services()->count() > 0) {
            throw new \Exception('Cannot delete category with associated services.');
        }

        return $category->delete();
    }

    /**
     * Reorder categories.
     */
    public function reorder(array $categoryOrders): bool
    {
        return DB::transaction(function () use ($categoryOrders) {
            foreach ($categoryOrders as $item) {
                ServiceCategory::where('id', $item['id'])->update(['order' => $item['order']]);
            }
            return true;
        });
    }

    /**
     * Generate a unique slug for the category.
     */
    protected function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (ServiceCategory::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
