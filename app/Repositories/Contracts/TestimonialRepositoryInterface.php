<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Testimonial Repository Interface
 */
interface TestimonialRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get published testimonials.
     *
     * @return Collection
     */
    public function getPublished(): Collection;

    /**
     * Get featured testimonials.
     *
     * @param int $limit
     * @return Collection
     */
    public function getFeatured(int $limit = 5): Collection;

    /**
     * Get testimonials by service.
     *
     * @param int $serviceId
     * @return Collection
     */
    public function getByService(int $serviceId): Collection;

    /**
     * Get average rating.
     *
     * @return float
     */
    public function getAverageRating(): float;

    /**
     * Toggle featured status.
     *
     * @param int $testimonialId
     * @return bool
     */
    public function toggleFeatured(int $testimonialId): bool;
}
