<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Template Repository Interface
 * 
 * Defines the contract for template data access operations.
 */
interface TemplateRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get active templates.
     *
     * @return Collection
     */
    public function getActive(): Collection;

    /**
     * Get templates with tenant count.
     *
     * @param array $filters
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginatedWithTenantCount(array $filters = [], int $perPage = 15);

    /**
     * Toggle template active status.
     *
     * @param int $templateId
     * @return bool
     */
    public function toggleActive(int $templateId): bool;

    /**
     * Get templates for select options.
     *
     * @return Collection
     */
    public function getForSelect(): Collection;

    /**
     * Check if template is in use by any tenant.
     *
     * @param int $templateId
     * @return bool
     */
    public function isInUse(int $templateId): bool;

    /**
     * Get count of tenants using template.
     *
     * @param int $templateId
     * @return int
     */
    public function getTenantCount(int $templateId): int;
}
