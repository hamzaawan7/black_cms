<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Template\StoreTemplateRequest;
use App\Http\Requests\Template\UpdateTemplateRequest;
use App\Http\Resources\TemplateResource;
use App\Models\Template;
use App\Services\TemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Template Controller
 * 
 * Handles HTTP requests for template management in the admin panel.
 * Uses TemplateService for business logic and repository pattern for data access.
 */
class TemplateController extends Controller
{
    /**
     * @var TemplateService
     */
    protected TemplateService $templateService;

    /**
     * Create a new controller instance.
     *
     * @param TemplateService $templateService
     */
    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    /**
     * Display a listing of templates.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active']);

        $templates = $this->templateService->getPaginated(
            perPage: 15,
            filters: $filters
        );

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new template.
     *
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Templates/Create');
    }

    /**
     * Store a newly created template.
     *
     * @param StoreTemplateRequest $request
     * @return RedirectResponse
     */
    public function store(StoreTemplateRequest $request): RedirectResponse
    {
        $template = $this->templateService->create($request->validated());

        return redirect()
            ->route('admin.templates.index')
            ->with('success', "Template '{$template->name}' has been created successfully.");
    }

    /**
     * Display the specified template.
     *
     * @param Template $template
     * @return Response
     */
    public function show(Template $template): Response
    {
        return Inertia::render('Admin/Templates/Show', [
            'template' => new TemplateResource($template),
            'tenantCount' => $this->templateService->getTenantCount($template),
        ]);
    }

    /**
     * Show the form for editing the template.
     *
     * @param Template $template
     * @return Response
     */
    public function edit(Template $template): Response
    {
        return Inertia::render('Admin/Templates/Edit', [
            'template' => new TemplateResource($template),
        ]);
    }

    /**
     * Update the template.
     *
     * @param UpdateTemplateRequest $request
     * @param Template $template
     * @return RedirectResponse
     */
    public function update(UpdateTemplateRequest $request, Template $template): RedirectResponse
    {
        $this->templateService->update($template, $request->validated());

        return redirect()
            ->route('admin.templates.index')
            ->with('success', "Template '{$template->name}' has been updated successfully.");
    }

    /**
     * Remove the template.
     *
     * @param Template $template
     * @return RedirectResponse
     */
    public function destroy(Template $template): RedirectResponse
    {
        // Check if template is in use
        if (!$this->templateService->canDelete($template)) {
            return back()->with('error', 'Cannot delete template that is in use by tenants.');
        }

        $templateName = $template->name;
        $this->templateService->delete($template);

        return redirect()
            ->route('admin.templates.index')
            ->with('success', "Template '{$templateName}' has been deleted successfully.");
    }

    /**
     * Toggle template active status.
     *
     * @param Template $template
     * @return RedirectResponse
     */
    public function toggleActive(Template $template): RedirectResponse
    {
        $this->templateService->toggleActive($template);

        $status = $template->fresh()->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Template '{$template->name}' has been {$status}.");
    }
}
