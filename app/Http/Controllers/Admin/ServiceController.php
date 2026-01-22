<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\ServiceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function __construct(protected ServiceService $serviceService)
    {
    }

    /**
     * Display a listing of the services.
     */
    public function index(): Response
    {
        $services = $this->serviceService->getPaginated(
            perPage: 15,
            filters: request()->only(['search', 'category_id', 'is_published'])
        );

        // Transform services with resource to include is_active alias
        $transformedServices = $services->through(fn($service) => [
            'id' => $service->id,
            'name' => $service->name,
            'slug' => $service->slug,
            'short_description' => $service->description,
            'image' => $service->image ? (str_starts_with($service->image, '/storage/') || str_starts_with($service->image, 'http') ? asset(ltrim($service->image, '/')) : asset('storage/' . $service->image)) : null,
            'is_popular' => $service->is_popular,
            'is_published' => $service->is_published,
            'is_active' => $service->is_published, // Alias for frontend
            'order' => $service->order,
            'category_id' => $service->category_id, // Include category_id for edit form
            'category' => $service->category ? [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
            ] : null,
            'created_at' => $service->created_at?->toISOString(),
            'updated_at' => $service->updated_at?->toISOString(),
        ]);

        return Inertia::render('Admin/Services/Index', [
            'services' => $transformedServices,
            'filters' => request()->only(['search', 'category_id', 'is_published']),
            'categories' => ServiceCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Services/Create', [
            'categories' => ServiceCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $service = $this->serviceService->create($request->validated());

        return redirect()
            ->route('admin.services.edit', $service)
            ->with('success', 'Service created successfully.');
    }

    /**
     * Show the form for editing the service.
     */
    public function edit(Service $service): Response
    {
        return Inertia::render('Admin/Services/Edit', [
            'service' => new ServiceResource($service->load('category')),
            'categories' => ServiceCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the service.
     */
    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $this->serviceService->update($service, $request->validated());

        return redirect()
            ->route('admin.services.edit', $service)
            ->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the service.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $this->serviceService->delete($service);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    /**
     * Toggle popular status.
     */
    public function togglePopular(Service $service): RedirectResponse
    {
        $this->serviceService->togglePopular($service);

        return back()->with('success', 'Service updated successfully.');
    }

    /**
     * Toggle published status.
     */
    public function togglePublished(Service $service): RedirectResponse
    {
        $this->serviceService->togglePublished($service);

        return back()->with('success', 'Service updated successfully.');
    }

    /**
     * Reorder services.
     */
    public function reorder(): RedirectResponse
    {
        $this->serviceService->reorder(request('orders', []));

        return back()->with('success', 'Services reordered successfully.');
    }
}
