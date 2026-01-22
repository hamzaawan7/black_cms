<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * User Repository Interface
 * 
 * Defines the contract for user data access operations.
 */
interface UserRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get users with their tenant relationship.
     *
     * @param int $perPage
     * @param array $filters
     * @param string|null $search
     * @return LengthAwarePaginator
     */
    public function getWithTenant(
        int $perPage = 15,
        array $filters = [],
        ?string $search = null
    ): LengthAwarePaginator;

    /**
     * Get users by role.
     *
     * @param string $role
     * @return Collection
     */
    public function getByRole(string $role): Collection;

    /**
     * Get users by tenant.
     *
     * @param int $tenantId
     * @return Collection
     */
    public function getByTenant(int $tenantId): Collection;

    /**
     * Get active users.
     *
     * @return Collection
     */
    public function getActive(): Collection;

    /**
     * Toggle user active status.
     *
     * @param int $userId
     * @return bool
     */
    public function toggleActive(int $userId): bool;

    /**
     * Find user by email.
     *
     * @param string $email
     * @return User|null
     */
    public function findByEmail(string $email): ?User;

    /**
     * Update user password.
     *
     * @param int $userId
     * @param string $hashedPassword
     * @return bool
     */
    public function updatePassword(int $userId, string $hashedPassword): bool;

    /**
     * Get user count by role.
     *
     * @return array
     */
    public function getCountByRole(): array;
}
