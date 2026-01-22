<?php

namespace App\Services;

use App\Models\Testimonial;
use App\Repositories\Contracts\TestimonialRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

/**
 * Testimonial Service
 *
 * Business logic layer for testimonial management.
 * Uses the Repository pattern for data access.
 */
class TestimonialService
{
    /**
     * @var TestimonialRepositoryInterface
     */
    protected TestimonialRepositoryInterface $testimonialRepository;

    /**
     * Create a new service instance.
     */
    public function __construct(TestimonialRepositoryInterface $testimonialRepository)
    {
        $this->testimonialRepository = $testimonialRepository;
    }

    /**
     * Get all testimonials for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        // Build query with filters
        $query = \App\Models\Testimonial::query();
        
        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }
        
        if (isset($filters['is_featured'])) {
            $query->where('is_featured', $filters['is_featured']);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated testimonials.
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        $query = \App\Models\Testimonial::query();

        // Apply filters
        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $query->where('is_featured', (bool) $filters['is_featured']);
        }
        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', (bool) $filters['is_published']);
        }

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('author_name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get published testimonials.
     */
    public function getPublished(): Collection
    {
        return $this->testimonialRepository->getPublished(['created_at' => 'desc']);
    }

    /**
     * Get featured testimonials.
     */
    public function getFeatured(int $limit = 6): Collection
    {
        return $this->testimonialRepository->getFeatured($limit);
    }

    /**
     * Get testimonials by service.
     */
    public function getByService(int $serviceId): Collection
    {
        return $this->testimonialRepository->getByService($serviceId);
    }

    /**
     * Get average rating.
     */
    public function getAverageRating(): float
    {
        return $this->testimonialRepository->getAverageRating();
    }

    /**
     * Get a testimonial by ID.
     */
    public function getById(int $id): ?Testimonial
    {
        return $this->testimonialRepository->findById($id);
    }

    /**
     * Create a new testimonial.
     */
    public function create(array $data): Testimonial
    {
        // Handle image upload
        if (isset($data['author_image']) && $data['author_image'] instanceof \Illuminate\Http\UploadedFile) {
            $data['author_image'] = $this->uploadImage($data['author_image']);
        }

        // Set default values
        if (!isset($data['is_featured'])) {
            $data['is_featured'] = false;
        }

        if (!isset($data['is_published'])) {
            $data['is_published'] = true;
        }

        if (!isset($data['rating'])) {
            $data['rating'] = 5;
        }

        return $this->testimonialRepository->create($data);
    }

    /**
     * Update a testimonial.
     */
    public function update(Testimonial $testimonial, array $data): Testimonial
    {
        // Handle image upload
        if (isset($data['author_image']) && $data['author_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image
            if ($testimonial->author_image) {
                $this->deleteImage($testimonial->author_image);
            }
            $data['author_image'] = $this->uploadImage($data['author_image']);
        } elseif (array_key_exists('author_image', $data) && $data['author_image'] === null) {
            // Delete old image if explicitly set to null
            if ($testimonial->author_image) {
                $this->deleteImage($testimonial->author_image);
            }
        } else {
            // Keep existing image
            unset($data['author_image']);
        }

        $this->testimonialRepository->update($testimonial->id, $data);
        return $testimonial->fresh();
    }

    /**
     * Delete a testimonial.
     */
    public function delete(Testimonial $testimonial): bool
    {
        // Delete associated image
        if ($testimonial->author_image) {
            $this->deleteImage($testimonial->author_image);
        }

        return $this->testimonialRepository->deleteById($testimonial->id);
    }

    /**
     * Toggle testimonial featured status.
     */
    public function toggleFeatured(Testimonial $testimonial): Testimonial
    {
        $this->testimonialRepository->update($testimonial->id, [
            'is_featured' => !$testimonial->is_featured,
        ]);
        return $testimonial->fresh();
    }

    /**
     * Toggle testimonial published status.
     */
    public function togglePublished(Testimonial $testimonial): Testimonial
    {
        $this->testimonialRepository->update($testimonial->id, [
            'is_published' => !$testimonial->is_published,
        ]);
        return $testimonial->fresh();
    }

    /**
     * Reorder testimonials.
     */
    public function reorder(array $orderedIds): void
    {
        foreach ($orderedIds as $order => $id) {
            $testimonial = $this->testimonialRepository->findById($id);
            if ($testimonial) {
                $this->testimonialRepository->update($id, ['order' => $order]);
            }
        }
    }

    /**
     * Bulk delete testimonials.
     */
    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            $testimonial = $this->testimonialRepository->findById($id);
            if ($testimonial && $this->delete($testimonial)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Upload an image.
     */
    protected function uploadImage(\Illuminate\Http\UploadedFile $file): string
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = 'testimonials/' . $filename;
        
        Storage::disk('public')->putFileAs('testimonials', $file, $filename);
        
        return '/storage/' . $path;
    }

    /**
     * Delete an image.
     */
    protected function deleteImage(string $path): bool
    {
        $storagePath = str_replace('/storage/', '', $path);
        return Storage::disk('public')->delete($storagePath);
    }

    /**
     * Get rating statistics.
     */
    public function getRatingStats(): array
    {
        $ratings = [];
        for ($i = 5; $i >= 1; $i--) {
            $ratings[$i] = Testimonial::where('rating', $i)
                ->where('is_published', true)
                ->count();
        }

        return [
            'average' => $this->getAverageRating(),
            'total' => array_sum($ratings),
            'breakdown' => $ratings,
        ];
    }
}
