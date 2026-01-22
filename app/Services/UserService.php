<?php

namespace App\Services;

use App\Models\User;
use App\Models\Tenant;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

/**
 * User Service
 * 
 * Business logic layer for user management.
 * Uses the Repository pattern for data access.
 */
class UserService
{
    /**
     * @var UserRepositoryInterface
     */
    protected UserRepositoryInterface $userRepository;

    /**
     * Create a new service instance.
     *
     * @param UserRepositoryInterface $userRepository
     */
    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Get paginated users with filters.
     *
     * @param int $perPage
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        return $this->userRepository->getWithTenant($perPage, $filters, $search);
    }

    /**
     * Get all users.
     *
     * @return Collection
     */
    public function getAll(): Collection
    {
        return $this->userRepository->all();
    }

    /**
     * Get users by role.
     *
     * @param string $role
     * @return Collection
     */
    public function getByRole(string $role): Collection
    {
        return $this->userRepository->getByRole($role);
    }

    /**
     * Get users by tenant.
     *
     * @param int $tenantId
     * @return Collection
     */
    public function getByTenant(int $tenantId): Collection
    {
        return $this->userRepository->getByTenant($tenantId);
    }

    /**
     * Get active users.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return $this->userRepository->getActive();
    }

    /**
     * Get user by ID.
     *
     * @param int $id
     * @return User|null
     */
    public function getById(int $id): ?User
    {
        return $this->userRepository->findById($id, ['*'], ['tenant']);
    }

    /**
     * Get user by email.
     *
     * @param string $email
     * @return User|null
     */
    public function getByEmail(string $email): ?User
    {
        return $this->userRepository->findByEmail($email);
    }

    /**
     * Create a new user.
     *
     * @param array $data
     * @return User
     */
    public function create(array $data): User
    {
        // Hash password
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // Handle avatar upload
        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            $data['avatar'] = $this->uploadAvatar($data['avatar']);
        }

        // Set default active status
        if (!isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        // Super admins don't need tenant
        if (($data['role'] ?? null) === 'super_admin') {
            $data['tenant_id'] = null;
        }

        return $this->userRepository->create($data);
    }

    /**
     * Update a user.
     *
     * @param User $user
     * @param array $data
     * @return User
     */
    public function update(User $user, array $data): User
    {
        // Hash password if provided and not empty
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Handle avatar upload
        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            // Delete old avatar
            if ($user->avatar) {
                $this->deleteAvatar($user->avatar);
            }
            $data['avatar'] = $this->uploadAvatar($data['avatar']);
        }

        // Super admins don't need tenant
        if (($data['role'] ?? $user->role) === 'super_admin') {
            $data['tenant_id'] = null;
        }

        $this->userRepository->update($user->id, $data);

        return $user->fresh(['tenant']);
    }

    /**
     * Delete a user.
     *
     * @param User $user
     * @return bool
     */
    public function delete(User $user): bool
    {
        // Delete avatar if exists
        if ($user->avatar) {
            $this->deleteAvatar($user->avatar);
        }

        return $this->userRepository->deleteById($user->id);
    }

    /**
     * Toggle user active status.
     *
     * @param User $user
     * @return User
     */
    public function toggleActive(User $user): User
    {
        $this->userRepository->toggleActive($user->id);

        return $user->fresh();
    }

    /**
     * Update user password.
     *
     * @param User $user
     * @param string $password
     * @return bool
     */
    public function updatePassword(User $user, string $password): bool
    {
        return $this->userRepository->updatePassword(
            $user->id,
            Hash::make($password)
        );
    }

    /**
     * Get user statistics by role.
     *
     * @return array
     */
    public function getStatsByRole(): array
    {
        return $this->userRepository->getCountByRole();
    }

    /**
     * Check if user can be deleted.
     *
     * @param User $user
     * @param User $currentUser
     * @return bool
     */
    public function canDelete(User $user, User $currentUser): bool
    {
        // Cannot delete yourself
        if ($user->id === $currentUser->id) {
            return false;
        }

        // Only super admins can delete other super admins
        if ($user->role === 'super_admin' && $currentUser->role !== 'super_admin') {
            return false;
        }

        return true;
    }

    /**
     * Check if user can be modified by current user.
     *
     * @param User $user
     * @param User $currentUser
     * @return bool
     */
    public function canModify(User $user, User $currentUser): bool
    {
        // Super admins can modify anyone
        if ($currentUser->role === 'super_admin') {
            return true;
        }

        // Tenant admins can modify users in their tenant
        if ($currentUser->role === 'tenant_admin') {
            return $user->tenant_id === $currentUser->tenant_id;
        }

        // Editors can only modify themselves
        return $user->id === $currentUser->id;
    }

    /**
     * Upload avatar image.
     *
     * @param UploadedFile $file
     * @return string
     */
    protected function uploadAvatar(UploadedFile $file): string
    {
        $path = $file->store('avatars', 'public');
        return Storage::url($path);
    }

    /**
     * Delete avatar image.
     *
     * @param string $avatarUrl
     * @return bool
     */
    protected function deleteAvatar(string $avatarUrl): bool
    {
        $path = str_replace('/storage/', '', $avatarUrl);
        return Storage::disk('public')->delete($path);
    }
}
