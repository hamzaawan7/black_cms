<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\TestimonialResource;
use App\Http\Resources\TestimonialCollection;
use App\Services\TestimonialService;

class TestimonialController extends BaseApiController
{
    public function __construct(protected TestimonialService $testimonialService)
    {
    }

    /**
     * Get all testimonials.
     */
    public function index()
    {
        $testimonials = $this->testimonialService->getAll(['is_published' => true]);

        return $this->successResponse(
            new TestimonialCollection($testimonials),
            'Testimonials retrieved successfully'
        );
    }

    /**
     * Get featured testimonials.
     */
    public function featured()
    {
        $limit = request()->get('limit', 6);
        $testimonials = $this->testimonialService->getFeatured($limit);

        return $this->successResponse(
            new TestimonialCollection($testimonials),
            'Featured testimonials retrieved successfully'
        );
    }

    /**
     * Get testimonials for a specific service.
     */
    public function byService(int $serviceId)
    {
        $testimonials = $this->testimonialService->getByService($serviceId);

        return $this->successResponse(
            new TestimonialCollection($testimonials),
            'Testimonials retrieved successfully'
        );
    }

    /**
     * Get average rating.
     */
    public function averageRating()
    {
        $average = $this->testimonialService->getAverageRating();

        return $this->successResponse(
            ['average_rating' => round($average, 1)],
            'Average rating retrieved successfully'
        );
    }
}
