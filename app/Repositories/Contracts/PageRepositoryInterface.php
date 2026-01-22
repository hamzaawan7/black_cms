<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Page Repository Interface
 */
interface PageRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get published pages.
     *
     * @param array $relations
     * @return Collection
     */
    public function getPublished(array $relations = []): Collection;

    /**
     * Get page with sections.
     *
     * @param string $slug
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function getWithSections(string $slug);

    /**
     * Duplicate page with sections.
     *
     * @param int $pageId
     * @param string $newSlug
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function duplicate(int $pageId, string $newSlug);
}
