<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreFaqRequest;
use App\Http\Requests\Faq\UpdateFaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Services\FaqService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function __construct(protected FaqService $faqService)
    {
    }

    /**
     * Display a listing of the FAQs.
     */
    public function index(): Response
    {
        $faqs = $this->faqService->getPaginated(
            perPage: 15,
            filters: request()->only(['search', 'category', 'is_published'])
        );

        return Inertia::render('Admin/Faqs/Index', [
            'faqs' => $faqs,
            'filters' => request()->only(['search', 'category', 'is_published']),
            'categories' => $this->faqService->getCategories(),
        ]);
    }

    /**
     * Show the form for creating a new FAQ.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Faqs/Create', [
            'categories' => $this->faqService->getCategories(),
        ]);
    }

    /**
     * Store a newly created FAQ.
     */
    public function store(StoreFaqRequest $request): RedirectResponse
    {
        $faq = $this->faqService->create($request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ created successfully.');
    }

    /**
     * Show the form for editing the FAQ.
     */
    public function edit(Faq $faq): Response
    {
        return Inertia::render('Admin/Faqs/Edit', [
            'faq' => new FaqResource($faq),
            'categories' => $this->faqService->getCategories(),
        ]);
    }

    /**
     * Update the FAQ.
     */
    public function update(UpdateFaqRequest $request, Faq $faq): RedirectResponse
    {
        $this->faqService->update($faq, $request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ updated successfully.');
    }

    /**
     * Remove the FAQ.
     */
    public function destroy(Faq $faq): RedirectResponse
    {
        $this->faqService->delete($faq);

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ deleted successfully.');
    }

    /**
     * Toggle published status.
     */
    public function togglePublished(Faq $faq): RedirectResponse
    {
        $this->faqService->togglePublished($faq);

        return back()->with('success', 'FAQ updated successfully.');
    }

    /**
     * Reorder FAQs.
     */
    public function reorder(): RedirectResponse
    {
        $this->faqService->reorder(request('orders', []));

        return back()->with('success', 'FAQs reordered successfully.');
    }
}
