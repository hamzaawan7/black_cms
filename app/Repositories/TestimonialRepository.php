<?php

namespace App\Repositories;

use App\Models\Testimonial;
use App\Repositories\Contracts\TestimonialRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Testimonial Repository Implementation
 */
class TestimonialRepository extends BaseRepository implements TestimonialRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param Testimonial $model
     */
    public function __construct(Testimonial $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getPublished(): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getFeatured(int $limit = 5): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('order')
            ->limit($limit)
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByService(int $serviceId): Collection
    {
        return $this->query()
            ->where('service_id', $serviceId)
            ->where('is_published', true)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getAverageRating(): float
    {
        return round($this->query()
            ->where('is_published', true)
            ->whereNotNull('rating')
            ->avg('rating') ?? 0, 1);
    }

    /**
     * {@inheritDoc}
     */
    public function toggleFeatured(int $testimonialId): bool
    {
        $testimonial = $this->findById($testimonialId);

        if (!$testimonial) {
            return false;
        }

        $testimonial->is_featured = !$testimonial->is_featured;
        return $testimonial->save();
    }

    /**
     * Get testimonials with filtering and search.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15)
    {
        $query = $this->query()->with(['service']);

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['author_name', 'content', 'author_title']);
        }

        return $query->orderBy('order')->paginate($perPage);
    }
}
