<?php

namespace App\Services;

use App\Models\Service;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Service Business Logic Layer
 *
 * Handles all business logic for services.
 * Uses repository pattern for data access.
 */
class ServiceService
{
    /**
     * Create a new service instance.
     */
    public function __construct(
        protected ServiceRepositoryInterface $serviceRepository,
        protected ServiceCategoryRepositoryInterface $categoryRepository
    ) {}

    /**
     * Get all services for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        return $this->serviceRepository->getWhere($filters, ['*'], ['category']);
    }

    /**
     * Get paginated services with filters and search.
     */
    public function getPaginated(int $perPage = 15, array $filters = [], ?string $search = null): LengthAwarePaginator
    {
        return $this->serviceRepository->getFiltered($filters, $search, $perPage);
    }

    /**
     * Get a service by ID.
     */
    public function getById(int $id): ?Model
    {
        return $this->serviceRepository->findById($id, ['*'], ['category', 'testimonials']);
    }

    /**
     * Get a service by slug.
     */
    public function getBySlug(string $slug): ?Model
    {
        return $this->serviceRepository->findBySlug($slug, ['*'], ['category', 'testimonials']);
    }

    /**
     * Get popular services.
     */
    public function getPopular(int $limit = 6): Collection
    {
        return $this->serviceRepository->getPopular($limit, ['category']);
    }

    /**
     * Get services by category.
     */
    public function getByCategory(int $categoryId): Collection
    {
        return $this->serviceRepository->getByCategory($categoryId, ['category']);
    }

    /**
     * Get services grouped by category.
     */
    public function getGroupedByCategory(): Collection
    {
        return $this->serviceRepository->getGroupedByCategory();
    }

    /**
     * Create a new service.
     */
    public function create(array $data): Model
    {
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Set default order if not provided
        if (!isset($data['order'])) {
            $data['order'] = $this->serviceRepository->count() + 1;
        }

        return $this->serviceRepository->create($data);
    }

    /**
     * Update a service.
     *
     * @param Service $service
     * @param array $data
     * @return Model
     */
    public function update(Service $service, array $data): Model
    {
        // Regenerate slug if name changed and slug not provided
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Map is_active to is_published (frontend uses is_active, database uses is_published)
        if (array_key_exists('is_active', $data)) {
            $data['is_published'] = $data['is_active'];
            unset($data['is_active']);
        }

        return $this->serviceRepository->update($service->id, $data);
    }

    /**
     * Delete a service.
     *
     * @param Service $service
     * @return bool
     */
    public function delete(Service $service): bool
    {
        return $this->serviceRepository->deleteById($service->id);
    }

    /**
     * Toggle publish status.
     *
     * @param Service $service
     * @return bool
     */
    public function togglePublish(Service $service): bool
    {
        return $this->serviceRepository->togglePublish($service->id);
    }

    /**
     * Toggle published status (alias for togglePublish).
     *
     * @param Service $service
     * @return bool
     */
    public function togglePublished(Service $service): bool
    {
        return $this->togglePublish($service);
    }

    /**
     * Toggle popular status.
     *
     * @param Service $service
     * @return bool
     */
    public function togglePopular(Service $service): bool
    {
        return $this->serviceRepository->togglePopular($service->id);
    }

    /**
     * Reorder services.
     *
     * @param array $orders
     * @return bool
     */
    public function reorder(array $orders): bool
    {
        return $this->serviceRepository->updateOrder($orders);
    }

    /**
     * Update services order.
     */
    public function updateOrder(array $orderedIds): bool
    {
        return $this->serviceRepository->updateOrder($orderedIds);
    }

    /**
     * Get all categories.
     */
    public function getCategories(): Collection
    {
        return $this->categoryRepository->getActive();
    }

    /**
     * Get categories with services.
     */
    public function getCategoriesWithServices(bool $publishedOnly = true): Collection
    {
        return $this->categoryRepository->getWithServices($publishedOnly);
    }

    /**
     * Get service statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => $this->serviceRepository->count(),
            'published' => $this->serviceRepository->count(['is_published' => true]),
            'unpublished' => $this->serviceRepository->count(['is_published' => false]),
            'popular' => $this->serviceRepository->count(['is_popular' => true]),
        ];
    }
}
