<?php

namespace App\Repositories;

use App\Models\TeamMember;
use App\Repositories\Contracts\TeamMemberRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Team Member Repository Implementation
 */
class TeamMemberRepository extends BaseRepository implements TeamMemberRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param TeamMember $model
     */
    public function __construct(TeamMember $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getPublished(): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function updateOrder(array $orderedIds): bool
    {
        return $this->transaction(function () use ($orderedIds) {
            foreach ($orderedIds as $index => $id) {
                $this->query()
                    ->where('id', $id)
                    ->update(['order' => $index]);
            }
            return true;
        });
    }

    /**
     * {@inheritDoc}
     */
    public function togglePublish(int $memberId): bool
    {
        $member = $this->findById($memberId);

        if (!$member) {
            return false;
        }

        $member->is_published = !$member->is_published;
        return $member->save();
    }

    /**
     * Get team members with filtering and search.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15)
    {
        $query = $this->query();

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['name', 'title', 'bio']);
        }

        return $query->orderBy('order')->paginate($perPage);
    }
}
