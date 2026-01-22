<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Service Repository Interface
 *
 * Extends BaseRepositoryInterface with service-specific methods.
 */
interface ServiceRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get published services.
     *
     * @param array $relations
     * @return Collection
     */
    public function getPublished(array $relations = []): Collection;

    /**
     * Get popular services.
     *
     * @param int $limit
     * @param array $relations
     * @return Collection
     */
    public function getPopular(int $limit = 6, array $relations = []): Collection;

    /**
     * Get services by category.
     *
     * @param int $categoryId
     * @param array $relations
     * @return Collection
     */
    public function getByCategory(int $categoryId, array $relations = []): Collection;

    /**
     * Get services grouped by category.
     *
     * @return Collection
     */
    public function getGroupedByCategory(): Collection;

    /**
     * Update service order.
     *
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(array $orderedIds): bool;

    /**
     * Toggle publish status.
     *
     * @param int $serviceId
     * @return bool
     */
    public function togglePublish(int $serviceId): bool;

    /**
     * Toggle popular status.
     *
     * @param int $serviceId
     * @return bool
     */
    public function togglePopular(int $serviceId): bool;

    /**
     * Get filtered services with pagination.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15): LengthAwarePaginator;
}
