<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Service Category Repository Interface
 */
interface ServiceCategoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get active categories.
     *
     * @param array $relations
     * @return Collection
     */
    public function getActive(array $relations = []): Collection;

    /**
     * Get categories with services.
     *
     * @param bool $publishedOnly
     * @return Collection
     */
    public function getWithServices(bool $publishedOnly = true): Collection;

    /**
     * Update category order.
     *
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(array $orderedIds): bool;
}
