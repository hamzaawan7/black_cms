<?php

namespace App\Services;

use App\Models\TeamMember;
use App\Repositories\Contracts\TeamMemberRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

/**
 * Team Member Service
 *
 * Business logic layer for team member management.
 * Uses the Repository pattern for data access.
 */
class TeamMemberService
{
    /**
     * @var TeamMemberRepositoryInterface
     */
    protected TeamMemberRepositoryInterface $teamMemberRepository;

    /**
     * Create a new service instance.
     */
    public function __construct(TeamMemberRepositoryInterface $teamMemberRepository)
    {
        $this->teamMemberRepository = $teamMemberRepository;
    }

    /**
     * Get all team members for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        // If filtering by is_published, use the getPublished method
        if (isset($filters['is_published']) && $filters['is_published'] === true) {
            return $this->teamMemberRepository->getPublished();
        }
        
        // Otherwise, get all with default columns
        return $this->teamMemberRepository->all(['*'], []);
    }

    /**
     * Get paginated team members.
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        $query = \App\Models\TeamMember::query();

        // Apply filters
        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', (bool) $filters['is_published']);
        }

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('order')->paginate($perPage);
    }

    /**
     * Get published team members.
     */
    public function getPublished(): Collection
    {
        return $this->teamMemberRepository->getPublished(['order' => 'asc']);
    }

    /**
     * Get a team member by ID.
     */
    public function getById(int $id): ?TeamMember
    {
        return $this->teamMemberRepository->findById($id);
    }

    /**
     * Create a new team member.
     */
    public function create(array $data): TeamMember
    {
        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['image'] = $this->uploadImage($data['image']);
        }

        // Set default order if not provided
        if (!isset($data['order'])) {
            $maxOrder = TeamMember::max('order');
            $data['order'] = ($maxOrder ?? -1) + 1;
        }

        // Set default published status
        if (!isset($data['is_published'])) {
            $data['is_published'] = true;
        }

        return $this->teamMemberRepository->create($data);
    }

    /**
     * Update a team member.
     */
    public function update(TeamMember $teamMember, array $data): TeamMember
    {
        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image
            if ($teamMember->image) {
                $this->deleteImage($teamMember->image);
            }
            $data['image'] = $this->uploadImage($data['image']);
        } elseif (array_key_exists('image', $data) && $data['image'] === null) {
            // Delete old image if explicitly set to null
            if ($teamMember->image) {
                $this->deleteImage($teamMember->image);
            }
        } else {
            // Keep existing image
            unset($data['image']);
        }

        $this->teamMemberRepository->update($teamMember->id, $data);
        return $teamMember->fresh();
    }

    /**
     * Delete a team member.
     */
    public function delete(TeamMember $teamMember): bool
    {
        // Delete associated image
        if ($teamMember->image) {
            $this->deleteImage($teamMember->image);
        }

        return $this->teamMemberRepository->deleteById($teamMember->id);
    }

    /**
     * Reorder team members.
     */
    public function reorder(array $orderedIds): void
    {
        $this->teamMemberRepository->updateOrder($orderedIds);
    }

    /**
     * Toggle team member published status.
     */
    public function togglePublished(TeamMember $teamMember): TeamMember
    {
        $this->teamMemberRepository->togglePublish($teamMember->id);
        return $teamMember->fresh();
    }

    /**
     * Bulk delete team members.
     */
    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            $teamMember = $this->teamMemberRepository->findById($id);
            if ($teamMember && $this->delete($teamMember)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Upload an image.
     */
    protected function uploadImage(\Illuminate\Http\UploadedFile $file): string
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'team/' . $filename;
        
        Storage::disk('public')->putFileAs('team', $file, $filename);
        
        return '/storage/' . $path;
    }

    /**
     * Delete an image.
     */
    protected function deleteImage(string $path): bool
    {
        $storagePath = str_replace('/storage/', '', $path);
        return Storage::disk('public')->delete($storagePath);
    }

    /**
     * Duplicate a team member.
     */
    public function duplicate(TeamMember $teamMember): TeamMember
    {
        $data = $teamMember->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $data['name'] = $data['name'] . ' (Copy)';
        $data['is_published'] = false;
        $data['order'] = TeamMember::max('order') + 1;

        // Don't copy the image reference - it would point to the same file
        unset($data['image']);

        return $this->teamMemberRepository->create($data);
    }

    /**
     * Get team statistics.
     */
    public function getStatistics(): array
    {
        return [
            'total' => TeamMember::count(),
            'published' => TeamMember::where('is_published', true)->count(),
            'unpublished' => TeamMember::where('is_published', false)->count(),
        ];
    }
}
