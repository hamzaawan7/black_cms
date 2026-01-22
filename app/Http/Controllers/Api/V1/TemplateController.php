<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\TemplateResource;
use App\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TemplateController extends BaseApiController
{
    public function __construct(protected TemplateService $templateService)
    {
    }

    /**
     * Get all available templates.
     */
    public function index(): JsonResponse
    {
        $templates = $this->templateService->getAll();

        return $this->successResponse(
            TemplateResource::collection($templates),
            'Templates retrieved successfully'
        );
    }

    /**
     * Get a single template by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $template = $this->templateService->getBySlug($slug);

        if (!$template) {
            return $this->notFoundResponse('Template not found');
        }

        return $this->successResponse(
            new TemplateResource($template),
            'Template retrieved successfully'
        );
    }

    /**
     * Get the current tenant's active template.
     */
    public function current(): JsonResponse
    {
        $tenant = request()->attributes->get('tenant');
        
        if (!$tenant) {
            return $this->errorResponse('Tenant not found', 404);
        }

        $template = $this->templateService->getTenantTemplate($tenant);

        if (!$template) {
            return $this->notFoundResponse('No template assigned to tenant');
        }

        return $this->successResponse(
            new TemplateResource($template),
            'Current template retrieved successfully'
        );
    }

    /**
     * Create a new template.
     * Requires admin authentication.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:templates,slug',
            'description' => 'nullable|string',
            'preview_image' => 'nullable|string',
            'version' => 'nullable|string|max:50',
            'supported_components' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $template = $this->templateService->create($validator->validated());

        return $this->successResponse(
            new TemplateResource($template),
            'Template created successfully',
            201
        );
    }

    /**
     * Update a template.
     * Requires admin authentication.
     */
    public function update(Request $request, string $slug): JsonResponse
    {
        $template = $this->templateService->getBySlug($slug);

        if (!$template) {
            return $this->notFoundResponse('Template not found');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:templates,slug,' . $template->id,
            'description' => 'nullable|string',
            'preview_image' => 'nullable|string',
            'version' => 'nullable|string|max:50',
            'supported_components' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $updated = $this->templateService->update($template, $validator->validated());

        return $this->successResponse(
            new TemplateResource($updated),
            'Template updated successfully'
        );
    }

    /**
     * Delete a template.
     * Requires admin authentication.
     */
    public function destroy(string $slug): JsonResponse
    {
        $template = $this->templateService->getBySlug($slug);

        if (!$template) {
            return $this->notFoundResponse('Template not found');
        }

        // Check if any tenants are using this template
        if ($template->tenants()->count() > 0) {
            return $this->errorResponse(
                'Cannot delete template: it is currently in use by ' . $template->tenants()->count() . ' tenant(s)',
                409
            );
        }

        $this->templateService->delete($template);

        return $this->successResponse(null, 'Template deleted successfully');
    }

    /**
     * Switch the current tenant's template.
     * Requires admin authentication.
     */
    public function switchTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'template_slug' => 'required|string|exists:templates,slug',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        
        if (!$tenant) {
            return $this->errorResponse('Tenant not found', 404);
        }

        $template = $this->templateService->getBySlug($request->template_slug);
        
        if (!$template->is_active) {
            return $this->errorResponse('Cannot switch to inactive template', 400);
        }

        $updated = $this->templateService->switchTenantTemplate($tenant, $template);

        return $this->successResponse(
            new TemplateResource($updated->activeTemplate),
            'Template switched successfully'
        );
    }

    /**
     * Get template preview data for a tenant.
     */
    public function preview(Request $request, string $slug): JsonResponse
    {
        $template = $this->templateService->getBySlug($slug);

        if (!$template) {
            return $this->notFoundResponse('Template not found');
        }

        $tenant = request()->attributes->get('tenant');
        $previewData = $this->templateService->getPreviewData($tenant, $template);

        return $this->successResponse($previewData, 'Template preview data retrieved');
    }

    /**
     * Get components supported by a template.
     */
    public function components(string $slug): JsonResponse
    {
        $template = $this->templateService->getBySlug($slug);

        if (!$template) {
            return $this->notFoundResponse('Template not found');
        }

        return $this->successResponse([
            'template' => $template->name,
            'components' => $template->supported_components ?? [],
        ], 'Template components retrieved');
    }

    /**
     * Check if a component is supported by the current template.
     */
    public function supportsComponent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'component' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        
        if (!$tenant || !$tenant->activeTemplate) {
            return $this->errorResponse('No template assigned to tenant', 404);
        }

        $supported = $this->templateService->supportsComponent(
            $tenant->activeTemplate,
            $request->component
        );

        return $this->successResponse([
            'component' => $request->component,
            'supported' => $supported,
            'template' => $tenant->activeTemplate->name,
        ], 'Component support checked');
    }
}
