<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * User Repository Implementation
 * 
 * Handles all database operations for User model.
 * Implements the UserRepositoryInterface contract.
 */
class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param User $model
     */
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getWithTenant(
        int $perPage = 15,
        array $filters = [],
        ?string $search = null
    ): LengthAwarePaginator {
        $query = $this->query()->with('tenant');

        // Apply role filter
        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        // Apply tenant filter
        if (!empty($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        // Apply active status filter
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * {@inheritDoc}
     */
    public function getByRole(string $role): Collection
    {
        return $this->query()
            ->where('role', $role)
            ->orderBy('name')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByTenant(int $tenantId): Collection
    {
        return $this->query()
            ->where('tenant_id', $tenantId)
            ->with('tenant')
            ->orderBy('name')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getActive(): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function toggleActive(int $userId): bool
    {
        $user = $this->findById($userId);

        if (!$user) {
            return false;
        }

        $user->is_active = !$user->is_active;
        return $user->save();
    }

    /**
     * {@inheritDoc}
     */
    public function findByEmail(string $email): ?User
    {
        return $this->query()
            ->where('email', $email)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function updatePassword(int $userId, string $hashedPassword): bool
    {
        return $this->query()
            ->where('id', $userId)
            ->update(['password' => $hashedPassword]) > 0;
    }

    /**
     * {@inheritDoc}
     */
    public function getCountByRole(): array
    {
        return $this->query()
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();
    }
}
