<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Section\StoreSectionRequest;
use App\Http\Requests\Section\UpdateSectionRequest;
use App\Http\Requests\Section\ReorderSectionsRequest;
use App\Http\Resources\SectionResource;
use App\Models\Section;
use App\Services\SectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class SectionController extends Controller
{
    public function __construct(protected SectionService $sectionService)
    {
    }

    /**
     * Store a newly created section.
     */
    public function store(StoreSectionRequest $request): RedirectResponse
    {
        $section = $this->sectionService->create($request->validated());

        return back()->with('success', 'Section created successfully.');
    }

    /**
     * Update the section.
     */
    public function update(UpdateSectionRequest $request, Section $section): RedirectResponse
    {
        $this->sectionService->update($section, $request->validated());

        return back()->with('success', 'Section updated successfully.');
    }

    /**
     * Remove the section.
     */
    public function destroy(Section $section): RedirectResponse
    {
        $this->sectionService->delete($section);

        return back()->with('success', 'Section deleted successfully.');
    }

    /**
     * Reorder sections.
     */
    public function reorder(ReorderSectionsRequest $request): RedirectResponse
    {
        $this->sectionService->reorder($request->validated()['sections']);

        return back()->with('success', 'Sections reordered successfully.');
    }

    /**
     * Move section up.
     */
    public function moveUp(Section $section): RedirectResponse
    {
        $this->sectionService->moveUp($section);

        return back()->with('success', 'Section moved up.');
    }

    /**
     * Move section down.
     */
    public function moveDown(Section $section): RedirectResponse
    {
        $this->sectionService->moveDown($section);

        return back()->with('success', 'Section moved down.');
    }

    /**
     * Duplicate the section.
     */
    public function duplicate(Section $section): RedirectResponse
    {
        $this->sectionService->duplicate($section);

        return back()->with('success', 'Section duplicated successfully.');
    }

    /**
     * Get available component types (for API).
     */
    public function componentTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->sectionService->getAvailableComponentTypes(),
        ]);
    }
}
