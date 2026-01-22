<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * FAQ Repository Interface
 */
interface FaqRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get published FAQs.
     *
     * @return Collection
     */
    public function getPublished(): Collection;

    /**
     * Get FAQs grouped by category.
     *
     * @param bool $publishedOnly
     * @return Collection
     */
    public function getGroupedByCategory(bool $publishedOnly = true): Collection;

    /**
     * Get FAQ categories.
     *
     * @return array
     */
    public function getCategories(): array;

    /**
     * Update order.
     *
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(array $orderedIds): bool;
}
