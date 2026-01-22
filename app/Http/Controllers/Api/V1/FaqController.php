<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\FaqResource;
use App\Http\Resources\FaqCollection;
use App\Services\FaqService;

class FaqController extends BaseApiController
{
    public function __construct(protected FaqService $faqService)
    {
    }

    /**
     * Get all FAQs.
     */
    public function index()
    {
        $category = request()->get('category');
        $filters = ['is_published' => true];

        if ($category) {
            $filters['category'] = $category;
        }

        $faqs = $this->faqService->getAll($filters);

        return $this->successResponse(
            new FaqCollection($faqs),
            'FAQs retrieved successfully'
        );
    }

    /**
     * Get FAQs grouped by category.
     */
    public function grouped()
    {
        $grouped = $this->faqService->getGroupedByCategory();

        return $this->successResponse(
            $grouped,
            'FAQs retrieved successfully'
        );
    }

    /**
     * Get all FAQ categories.
     */
    public function categories()
    {
        $categories = $this->faqService->getCategories();

        return $this->successResponse(
            $categories,
            'FAQ categories retrieved successfully'
        );
    }
}
