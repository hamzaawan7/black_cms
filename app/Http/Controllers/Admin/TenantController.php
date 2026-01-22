<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreTenantRequest;
use App\Http\Requests\Tenant\UpdateTenantRequest;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Models\Template;
use App\Services\TenantService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Tenant Controller
 * 
 * Handles HTTP requests for tenant management in the admin panel.
 * Uses TenantService for business logic and repository pattern for data access.
 */
class TenantController extends Controller
{
    /**
     * @var TenantService
     */
    protected TenantService $tenantService;

    /**
     * Create a new controller instance.
     *
     * @param TenantService $tenantService
     */
    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Display a listing of tenants.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active']);

        $tenants = $this->tenantService->getPaginated(
            perPage: 15,
            filters: $filters
        );

        $templates = Template::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'preview_image', 'description']);

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $filters,
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new tenant.
     *
     * @return Response
     */
    public function create(): Response
    {
        $templates = Template::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'preview_image']);

        return Inertia::render('Admin/Tenants/Create', [
            'templates' => $templates,
        ]);
    }

    /**
     * Store a newly created tenant.
     *
     * @param StoreTenantRequest $request
     * @return RedirectResponse
     */
    public function store(StoreTenantRequest $request): RedirectResponse
    {
        $tenant = $this->tenantService->create($request->validated());

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', "Tenant '{$tenant->name}' has been created successfully.");
    }

    /**
     * Display the specified tenant.
     *
     * @param Tenant $tenant
     * @return Response
     */
    public function show(Tenant $tenant): Response
    {
        $tenant->load('activeTemplate');

        return Inertia::render('Admin/Tenants/Show', [
            'tenant' => new TenantResource($tenant),
            'statistics' => $this->tenantService->getStatistics($tenant),
        ]);
    }

    /**
     * Show the form for editing the tenant.
     *
     * @param Tenant $tenant
     * @return Response
     */
    public function edit(Tenant $tenant): Response
    {
        $tenant->load('activeTemplate');

        $templates = Template::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'preview_image']);

        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => new TenantResource($tenant),
            'templates' => $templates,
        ]);
    }

    /**
     * Update the tenant.
     *
     * @param UpdateTenantRequest $request
     * @param Tenant $tenant
     * @return RedirectResponse
     */
    public function update(UpdateTenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $this->tenantService->update($tenant, $request->validated());

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', "Tenant '{$tenant->name}' has been updated successfully.");
    }

    /**
     * Remove the tenant.
     *
     * @param Tenant $tenant
     * @return RedirectResponse
     */
    public function destroy(Tenant $tenant): RedirectResponse
    {
        // Check if tenant has users
        if ($tenant->users()->count() > 0) {
            return back()->with('error', 'Cannot delete tenant with associated users. Remove users first.');
        }

        $tenantName = $tenant->name;
        $this->tenantService->delete($tenant);

        return redirect()
            ->route('admin.tenants.index')
            ->with('success', "Tenant '{$tenantName}' has been deleted successfully.");
    }

    /**
     * Toggle tenant active status.
     *
     * @param Tenant $tenant
     * @return RedirectResponse
     */
    public function toggleActive(Tenant $tenant): RedirectResponse
    {
        $this->tenantService->toggleActive($tenant);

        $status = $tenant->fresh()->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Tenant '{$tenant->name}' has been {$status}.");
    }
}
