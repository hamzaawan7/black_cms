<?php

namespace App\Repositories;

use App\Models\Menu;
use App\Repositories\Contracts\MenuRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Menu Repository Implementation
 */
class MenuRepository extends BaseRepository implements MenuRepositoryInterface
{
    /**
     * Available menu locations.
     *
     * @var array
     */
    protected array $locations = [
        'header' => 'Header Navigation',
        'footer' => 'Footer Navigation',
        'mobile' => 'Mobile Navigation',
        'sidebar' => 'Sidebar Navigation',
    ];

    /**
     * Create a new repository instance.
     *
     * @param Menu $model
     */
    public function __construct(Menu $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getActive(): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByLocation(string $location): Collection
    {
        return $this->query()
            ->where('location', $location)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getLocations(): array
    {
        return $this->locations;
    }

    /**
     * {@inheritDoc}
     */
    public function updateOrder(string $location, array $orderedIds): bool
    {
        return $this->transaction(function () use ($location, $orderedIds) {
            foreach ($orderedIds as $index => $id) {
                $this->query()
                    ->where('id', $id)
                    ->where('location', $location)
                    ->update(['order' => $index]);
            }
            return true;
        });
    }

    /**
     * {@inheritDoc}
     */
    public function buildNestedMenu(string $location): array
    {
        $menus = $this->getByLocation($location);

        // Build tree structure
        $menuTree = [];
        $menuById = [];

        foreach ($menus as $menu) {
            $menuById[$menu->id] = [
                'id' => $menu->id,
                'label' => $menu->label,
                'url' => $menu->url,
                'target' => $menu->target,
                'icon' => $menu->icon,
                'children' => [],
            ];
        }

        foreach ($menus as $menu) {
            if ($menu->parent_id && isset($menuById[$menu->parent_id])) {
                $menuById[$menu->parent_id]['children'][] = &$menuById[$menu->id];
            } else {
                $menuTree[] = &$menuById[$menu->id];
            }
        }

        return $menuTree;
    }

    /**
     * Get menus with filtering.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 50)
    {
        $query = $this->query();

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['label', 'url']);
        }

        return $query->orderBy('location')->orderBy('order')->paginate($perPage);
    }
}
