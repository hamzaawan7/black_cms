<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Database\Eloquent\Collection;

class MenuService
{
    /**
     * Get all menus for the current tenant.
     */
    public function getAll(): Collection
    {
        // For admin panel, explicitly get menus for the authenticated user's tenant
        // This bypasses the global scope which may not work correctly in all contexts
        $query = Menu::withoutGlobalScope('tenant')->orderBy('name');
        
        if (auth()->check() && auth()->user()->tenant_id) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        return $query->get();
    }

    /**
     * Get menus by location.
     */
    public function getByLocation(string $location): ?Menu
    {
        $query = Menu::withoutGlobalScope('tenant')
            ->where('location', $location)
            ->where('is_active', true);
        
        // For API context, check request attributes first (set by TenantMiddleware)
        if (request()->attributes->has('tenant_id')) {
            $query->where('tenant_id', request()->attributes->get('tenant_id'));
        }
        // For admin context, use authenticated user's tenant
        elseif (auth()->check() && auth()->user()->tenant_id) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        return $query->first();
    }

    /**
     * Get a menu by ID.
     */
    public function getById(int $id): ?Menu
    {
        $query = Menu::withoutGlobalScope('tenant')->where('id', $id);
        
        // Ensure user can only access menus from their tenant
        if (auth()->check() && auth()->user()->tenant_id) {
            $query->where('tenant_id', auth()->user()->tenant_id);
        }
        
        return $query->first();
    }

    /**
     * Create a new menu.
     */
    public function create(array $data): Menu
    {
        // Process items to ensure proper structure
        if (isset($data['items'])) {
            $data['items'] = $this->processItems($data['items']);
        }

        return Menu::create($data);
    }

    /**
     * Update a menu.
     */
    public function update(Menu $menu, array $data): Menu
    {
        // Process items to ensure proper structure
        if (isset($data['items'])) {
            $data['items'] = $this->processItems($data['items']);
        }

        $menu->update($data);
        return $menu->fresh();
    }

    /**
     * Delete a menu.
     */
    public function delete(Menu $menu): bool
    {
        return $menu->delete();
    }

    /**
     * Add an item to a menu.
     */
    public function addItem(Menu $menu, array $item): Menu
    {
        $items = $menu->items ?? [];
        $item['order'] = count($items);
        $items[] = $this->processItem($item);

        $menu->update(['items' => $items]);
        return $menu->fresh();
    }

    /**
     * Update a menu item.
     */
    public function updateItem(Menu $menu, int $index, array $item): Menu
    {
        $items = $menu->items ?? [];

        if (!isset($items[$index])) {
            throw new \Exception('Menu item not found.');
        }

        $items[$index] = array_merge($items[$index], $this->processItem($item));

        $menu->update(['items' => $items]);
        return $menu->fresh();
    }

    /**
     * Remove an item from a menu.
     */
    public function removeItem(Menu $menu, int $index): Menu
    {
        $items = $menu->items ?? [];

        if (!isset($items[$index])) {
            throw new \Exception('Menu item not found.');
        }

        array_splice($items, $index, 1);

        // Reorder remaining items
        foreach ($items as $i => $item) {
            $items[$i]['order'] = $i;
        }

        $menu->update(['items' => $items]);
        return $menu->fresh();
    }

    /**
     * Reorder menu items.
     */
    public function reorderItems(Menu $menu, array $order): Menu
    {
        $items = $menu->items ?? [];
        $reordered = [];

        foreach ($order as $newIndex => $oldIndex) {
            if (isset($items[$oldIndex])) {
                $item = $items[$oldIndex];
                $item['order'] = $newIndex;
                $reordered[] = $item;
            }
        }

        $menu->update(['items' => $reordered]);
        return $menu->fresh();
    }

    /**
     * Process items array.
     */
    protected function processItems(array $items): array
    {
        return array_map(function ($item, $index) {
            $item['order'] = $item['order'] ?? $index;
            return $this->processItem($item);
        }, $items, array_keys($items));
    }

    /**
     * Process a single item.
     */
    protected function processItem(array $item): array
    {
        return [
            'label' => $item['label'] ?? $item['title'] ?? '',
            'title' => $item['title'] ?? $item['label'] ?? '',
            'url' => $item['url'] ?? '',
            'target' => $item['target'] ?? '_self',
            'icon' => $item['icon'] ?? null,
            'image' => $item['image'] ?? null,
            'order' => $item['order'] ?? 0,
            'children' => isset($item['children']) ? $this->processItems($item['children']) : [],
        ];
    }

    /**
     * Get available menu locations.
     */
    public function getAvailableLocations(): array
    {
        return [
            'header' => 'Header Navigation',
            'footer' => 'Footer Navigation',
            'footer-services' => 'Footer Services',
            'footer-about' => 'Footer About',
            'footer-vip' => 'Footer VIP',
            'footer-legal' => 'Footer Legal',
            'services' => 'Services Menu',
            'sidebar' => 'Sidebar Navigation',
            'mobile' => 'Mobile Navigation',
            'social' => 'Social Links',
        ];
    }
}
