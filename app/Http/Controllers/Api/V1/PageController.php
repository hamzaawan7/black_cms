<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\PageResource;
use App\Services\PageService;

class PageController extends BaseApiController
{
    public function __construct(protected PageService $pageService)
    {
    }

    /**
     * Get all published pages.
     */
    public function index()
    {
        $pages = $this->pageService->getAll(['is_published' => true]);

        return $this->successResponse(
            PageResource::collection($pages),
            'Pages retrieved successfully'
        );
    }

    /**
     * Get a single page by slug with its sections.
     */
    public function show(string $slug)
    {
        $page = $this->pageService->getBySlug($slug);

        if (!$page) {
            return $this->notFoundResponse('Page not found');
        }

        return $this->successResponse(
            new PageResource($page),
            'Page retrieved successfully'
        );
    }
}
