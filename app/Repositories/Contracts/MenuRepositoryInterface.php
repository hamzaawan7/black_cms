<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Menu Repository Interface
 */
interface MenuRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get active menus.
     *
     * @return Collection
     */
    public function getActive(): Collection;

    /**
     * Get menus by location.
     *
     * @param string $location
     * @return Collection
     */
    public function getByLocation(string $location): Collection;

    /**
     * Get available locations.
     *
     * @return array
     */
    public function getLocations(): array;

    /**
     * Update menu order.
     *
     * @param string $location
     * @param array $orderedIds
     * @return bool
     */
    public function updateOrder(string $location, array $orderedIds): bool;

    /**
     * Build nested menu structure.
     *
     * @param string $location
     * @return array
     */
    public function buildNestedMenu(string $location): array;
}
