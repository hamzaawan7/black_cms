<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\MenuResource;
use App\Services\MenuService;

class MenuController extends BaseApiController
{
    public function __construct(protected MenuService $menuService)
    {
    }

    /**
     * Get all menus.
     */
    public function index()
    {
        $menus = $this->menuService->getAll();

        return $this->successResponse(
            MenuResource::collection($menus),
            'Menus retrieved successfully'
        );
    }

    /**
     * Get a menu by location.
     * Returns an empty menu structure if not found (instead of 404)
     * This allows the frontend to gracefully handle inactive menus
     */
    public function byLocation(string $location)
    {
        $menu = $this->menuService->getByLocation($location);

        if (!$menu) {
            // Return an empty menu structure instead of 404
            // This allows frontend to gracefully use fallback/default content
            return $this->successResponse(
                [
                    'id' => null,
                    'name' => null,
                    'location' => $location,
                    'items' => [],
                    'is_active' => false,
                ],
                'No active menu found for this location'
            );
        }

        return $this->successResponse(
            new MenuResource($menu),
            'Menu retrieved successfully'
        );
    }

    /**
     * Get available menu locations.
     */
    public function locations()
    {
        $locations = $this->menuService->getAvailableLocations();

        return $this->successResponse(
            $locations,
            'Menu locations retrieved successfully'
        );
    }
}
