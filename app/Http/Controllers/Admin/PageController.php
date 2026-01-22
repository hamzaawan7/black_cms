<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Page\StorePageRequest;
use App\Http\Requests\Page\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use App\Models\Template;
use App\Services\PageService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(protected PageService $pageService)
    {
    }

    /**
     * Display a listing of the pages.
     */
    public function index(): Response
    {
        $pages = $this->pageService->getPaginated(
            perPage: 15,
            filters: request()->only(['search', 'is_published', 'template_id'])
        );

        return Inertia::render('Admin/Pages/Index', [
            'pages' => $pages,
            'filters' => request()->only(['search', 'is_published', 'template_id']),
            'templates' => Template::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new page.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Pages/Create', [
            'templates' => Template::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created page.
     */
    public function store(StorePageRequest $request): RedirectResponse
    {
        $page = $this->pageService->create($request->validated());

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page created successfully.');
    }

    /**
     * Show the form for editing the page.
     */
    public function edit(Page $page): Response
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => new PageResource($page->load(['sections'])),
            'templates' => Template::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the page.
     */
    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $this->pageService->update($page, $request->validated());

        return redirect()
            ->route('admin.pages.edit', $page)
            ->with('success', 'Page updated successfully.');
    }

    /**
     * Remove the page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        $this->pageService->delete($page);

        return redirect()
            ->route('admin.pages.index')
            ->with('success', 'Page deleted successfully.');
    }

    /**
     * Duplicate the page.
     */
    public function duplicate(Page $page): RedirectResponse
    {
        $newSlug = $page->slug . '-copy-' . time();
        $newPage = $this->pageService->duplicate($page, $newSlug);

        return redirect()
            ->route('admin.pages.edit', $newPage)
            ->with('success', 'Page duplicated successfully.');
    }
}
