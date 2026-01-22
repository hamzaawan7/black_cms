<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Menu\StoreMenuRequest;
use App\Http\Requests\Menu\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Service;
use App\Services\MenuService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function __construct(protected MenuService $menuService)
    {
    }

    /**
     * Get available link options for menu items (pages, services, etc.)
     */
    protected function getLinkOptions(): array
    {
        $pages = Page::select('id', 'title', 'slug')
            ->where('is_published', true)
            ->orderBy('title')
            ->get()
            ->map(fn($page) => [
                'label' => $page->title,
                'url' => "/{$page->slug}",
                'type' => 'page',
            ]);

        $services = Service::select('id', 'name', 'slug')
            ->where('is_published', true)
            ->orderBy('name')
            ->get()
            ->map(fn($service) => [
                'label' => $service->name,
                'url' => "/services/{$service->slug}",
                'type' => 'service',
            ]);

        return [
            'pages' => $pages,
            'services' => $services,
        ];
    }

    /**
     * Display a listing of the menus.
     */
    public function index(): Response
    {
        $menus = $this->menuService->getAll();

        return Inertia::render('Admin/Menus/Index', [
            // Use ->resolve() to get array without the { data: [...] } wrapper
            'menus' => MenuResource::collection($menus)->resolve(),
            'locations' => $this->menuService->getAvailableLocations(),
            'linkOptions' => $this->getLinkOptions(),
        ]);
    }

    /**
     * Show the form for creating a new menu.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Menus/Create', [
            'locations' => $this->menuService->getAvailableLocations(),
        ]);
    }

    /**
     * Store a newly created menu.
     */
    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $menu = $this->menuService->create($request->validated());

        return redirect()
            ->route('admin.menus.index')
            ->with('success', 'Menu created successfully.');
    }

    /**
     * Show the form for editing the menu.
     */
    public function edit(Menu $menu): Response
    {
        // Redirect to index since we use modal-based editing
        return Inertia::render('Admin/Menus/Index', [
            'menus' => MenuResource::collection($this->menuService->getAll())->resolve(),
            'locations' => $this->menuService->getAvailableLocations(),
            'linkOptions' => $this->getLinkOptions(),
            'editMenuId' => $menu->id,  // Pass which menu to edit
        ]);
    }

    /**
     * Update the menu.
     */
    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $this->menuService->update($menu, $request->validated());

        return redirect()
            ->route('admin.menus.index')
            ->with('success', 'Menu updated successfully.');
    }

    /**
     * Remove the menu.
     */
    public function destroy(Menu $menu): RedirectResponse
    {
        $this->menuService->delete($menu);

        return redirect()
            ->route('admin.menus.index')
            ->with('success', 'Menu deleted successfully.');
    }

    /**
     * Toggle the menu's active status.
     */
    public function toggleActive(Menu $menu): RedirectResponse
    {
        $menu->update(['is_active' => !$menu->is_active]);

        return redirect()
            ->route('admin.menus.index')
            ->with('success', $menu->is_active ? 'Menu activated.' : 'Menu deactivated.');
    }
}
