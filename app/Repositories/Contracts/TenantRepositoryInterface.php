<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Tenant Repository Interface
 */
interface TenantRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get active tenants.
     *
     * @return Collection
     */
    public function getActive(): Collection;

    /**
     * Find tenant by domain.
     *
     * @param string $domain
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function findByDomain(string $domain);

    /**
     * Get tenant with template.
     *
     * @param int $tenantId
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function getWithTemplate(int $tenantId);

    /**
     * Get tenant statistics.
     *
     * @param int $tenantId
     * @return array
     */
    public function getStatistics(int $tenantId): array;

    /**
     * Toggle tenant status.
     *
     * @param int $tenantId
     * @return bool
     */
    public function toggleActive(int $tenantId): bool;

    /**
     * Get filtered tenants with pagination.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15): LengthAwarePaginator;
}
