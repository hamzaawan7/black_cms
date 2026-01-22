<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\SectionResource;
use App\Services\SectionService;
use App\Services\SectionTypeRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SectionController extends BaseApiController
{
    public function __construct(
        protected SectionService $sectionService,
        protected SectionTypeRegistry $typeRegistry
    ) {}

    /**
     * Get all sections for a page.
     */
    public function index(int $pageId): JsonResponse
    {
        $sections = $this->sectionService->getByPage($pageId);

        return $this->successResponse(
            SectionResource::collection($sections),
            'Sections retrieved successfully'
        );
    }

    /**
     * Get a single section.
     */
    public function show(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        return $this->successResponse(
            new SectionResource($section),
            'Section retrieved successfully'
        );
    }

    /**
     * Create a new section.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id',
            'component_type' => 'required|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_visible' => 'boolean',
            'content' => 'nullable|array',
            'styles' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $data = $validator->validated();

        // Validate component type is allowed
        if (!$this->typeRegistry->isValidType($data['component_type'])) {
            return $this->errorResponse(
                "Invalid component type: {$data['component_type']}. Allowed types: " . 
                implode(', ', $this->typeRegistry->getAllTypes()),
                400
            );
        }

        $section = $this->sectionService->create($data);

        return $this->successResponse(
            new SectionResource($section),
            'Section created successfully',
            201
        );
    }

    /**
     * Update a section.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $validator = Validator::make($request->all(), [
            'component_type' => 'sometimes|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_visible' => 'boolean',
            'content' => 'nullable|array',
            'styles' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $data = $validator->validated();

        // Validate component type if provided
        if (isset($data['component_type']) && !$this->typeRegistry->isValidType($data['component_type'])) {
            return $this->errorResponse(
                "Invalid component type: {$data['component_type']}",
                400
            );
        }

        $updated = $this->sectionService->update($section, $data);

        return $this->successResponse(
            new SectionResource($updated),
            'Section updated successfully'
        );
    }

    /**
     * Delete a section.
     */
    public function destroy(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $this->sectionService->delete($section);

        return $this->successResponse(null, 'Section deleted successfully');
    }

    /**
     * Reorder sections for a page.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:sections,id',
            'sections.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $this->sectionService->reorder($request->sections);

        return $this->successResponse(null, 'Sections reordered successfully');
    }

    /**
     * Move section up in order.
     */
    public function moveUp(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $updated = $this->sectionService->moveUp($section);

        return $this->successResponse(
            new SectionResource($updated),
            'Section moved up'
        );
    }

    /**
     * Move section down in order.
     */
    public function moveDown(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $updated = $this->sectionService->moveDown($section);

        return $this->successResponse(
            new SectionResource($updated),
            'Section moved down'
        );
    }

    /**
     * Toggle section visibility.
     */
    public function toggleVisibility(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $section->update(['is_visible' => !$section->is_visible]);

        return $this->successResponse(
            new SectionResource($section->fresh()),
            'Section visibility toggled'
        );
    }

    /**
     * Duplicate a section.
     */
    public function duplicate(int $id): JsonResponse
    {
        $section = $this->sectionService->getById($id);

        if (!$section) {
            return $this->notFoundResponse('Section not found');
        }

        $newSection = $this->sectionService->create([
            'page_id' => $section->page_id,
            'component_type' => $section->component_type,
            'is_visible' => false, // Start as hidden
            'content' => $section->content,
            'styles' => $section->styles,
            'settings' => $section->settings,
        ]);

        return $this->successResponse(
            new SectionResource($newSection),
            'Section duplicated successfully',
            201
        );
    }

    /**
     * Get all available section types.
     */
    public function types(): JsonResponse
    {
        return $this->successResponse(
            $this->typeRegistry->getAllTypesWithSchema(),
            'Section types retrieved'
        );
    }

    /**
     * Get schema for a specific section type.
     */
    public function typeSchema(string $type): JsonResponse
    {
        if (!$this->typeRegistry->isValidType($type)) {
            return $this->notFoundResponse("Section type '{$type}' not found");
        }

        return $this->successResponse(
            $this->typeRegistry->getTypeSchema($type),
            'Section type schema retrieved'
        );
    }

    /**
     * Get default content for a section type.
     */
    public function typeDefaults(string $type): JsonResponse
    {
        if (!$this->typeRegistry->isValidType($type)) {
            return $this->notFoundResponse("Section type '{$type}' not found");
        }

        return $this->successResponse(
            $this->typeRegistry->getDefaultContent($type),
            'Section type defaults retrieved'
        );
    }
}
