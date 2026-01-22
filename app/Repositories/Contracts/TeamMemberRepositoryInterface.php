<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Team Member Repository Interface
 */
interface TeamMemberRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get published team members.
     *
     * @return Collection
     */
    public function getPublished(): Collection;

    /**
     * Update order.
     *
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(array $orderedIds): bool;

    /**
     * Toggle publish status.
     *
     * @param int $memberId
     * @return bool
     */
    public function togglePublish(int $memberId): bool;
}
