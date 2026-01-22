<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Testimonial\StoreTestimonialRequest;
use App\Http\Requests\Testimonial\UpdateTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Service;
use App\Models\Testimonial;
use App\Services\TestimonialService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function __construct(protected TestimonialService $testimonialService)
    {
    }

    /**
     * Display a listing of the testimonials.
     */
    public function index(): Response
    {
        $testimonials = $this->testimonialService->getPaginated(
            perPage: 15,
            filters: request()->only(['search', 'is_featured', 'is_published'])
        );

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => $testimonials,
            'filters' => request()->only(['search', 'is_featured', 'is_published']),
        ]);
    }

    /**
     * Show the form for creating a new testimonial.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Testimonials/Create', [
            'services' => Service::where('is_published', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created testimonial.
     */
    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        $testimonial = $this->testimonialService->create($request->validated());

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial created successfully.');
    }

    /**
     * Show the form for editing the testimonial.
     */
    public function edit(Testimonial $testimonial): Response
    {
        return Inertia::render('Admin/Testimonials/Edit', [
            'testimonial' => new TestimonialResource($testimonial->load('service')),
            'services' => Service::where('is_published', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * Update the testimonial.
     */
    public function update(UpdateTestimonialRequest $request, Testimonial $testimonial): RedirectResponse
    {
        $this->testimonialService->update($testimonial, $request->validated());

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Remove the testimonial.
     */
    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $this->testimonialService->delete($testimonial);

        return redirect()
            ->route('admin.testimonials.index')
            ->with('success', 'Testimonial deleted successfully.');
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Testimonial $testimonial): RedirectResponse
    {
        $this->testimonialService->toggleFeatured($testimonial);

        return back()->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Toggle published status.
     */
    public function togglePublished(Testimonial $testimonial): RedirectResponse
    {
        $this->testimonialService->togglePublished($testimonial);

        return back()->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Reorder testimonials.
     */
    public function reorder(): RedirectResponse
    {
        $this->testimonialService->reorder(request('orders', []));

        return back()->with('success', 'Testimonials reordered successfully.');
    }
}
