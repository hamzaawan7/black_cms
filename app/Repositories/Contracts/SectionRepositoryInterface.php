<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Section Repository Interface
 */
interface SectionRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get sections by page.
     *
     * @param int $pageId
     * @param bool $publishedOnly
     * @return Collection
     */
    public function getByPage(int $pageId, bool $publishedOnly = false): Collection;

    /**
     * Update sections order for a page.
     *
     * @param int $pageId
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(int $pageId, array $orderedIds): bool;

    /**
     * Duplicate section.
     *
     * @param int $sectionId
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function duplicate(int $sectionId);

    /**
     * Get available section types.
     *
     * @return array
     */
    public function getAvailableTypes(): array;
}
