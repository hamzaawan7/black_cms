<?php

namespace App\Services;

use App\Models\Faq;
use App\Repositories\Contracts\FaqRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * FAQ Service
 *
 * Business logic layer for FAQ management.
 * Uses the Repository pattern for data access.
 */
class FaqService
{
    /**
     * @var FaqRepositoryInterface
     */
    protected FaqRepositoryInterface $faqRepository;

    /**
     * Create a new service instance.
     */
    public function __construct(FaqRepositoryInterface $faqRepository)
    {
        $this->faqRepository = $faqRepository;
    }

    /**
     * Get all FAQs for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        // Build query with filters
        $query = \App\Models\Faq::query();
        
        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }
        
        if (isset($filters['category']) && $filters['category']) {
            $query->where('category', $filters['category']);
        }
        
        return $query->orderBy('order')->get();
    }

    /**
     * Get paginated FAQs.
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        $query = \App\Models\Faq::query();

        // Apply filters
        if (isset($filters['category']) && $filters['category']) {
            $query->where('category', $filters['category']);
        }
        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', (bool) $filters['is_published']);
        }

        // Apply search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('order')->paginate($perPage);
    }

    /**
     * Get published FAQs.
     */
    public function getPublished(): Collection
    {
        return $this->faqRepository->getPublished(['order' => 'asc']);
    }

    /**
     * Get FAQs grouped by category.
     */
    public function getGroupedByCategory(): array
    {
        $grouped = $this->faqRepository->getGroupedByCategory();
        return $grouped->toArray();
    }

    /**
     * Get available categories.
     */
    public function getCategories(): array
    {
        return $this->faqRepository->getCategories();
    }

    /**
     * Get a FAQ by ID.
     */
    public function getById(int $id): ?Faq
    {
        return $this->faqRepository->findById($id);
    }

    /**
     * Create a new FAQ.
     */
    public function create(array $data): Faq
    {
        // Set default order if not provided
        if (!isset($data['order'])) {
            $maxOrder = Faq::max('order');
            $data['order'] = ($maxOrder ?? -1) + 1;
        }

        // Set default published status
        if (!isset($data['is_published'])) {
            $data['is_published'] = true;
        }

        return $this->faqRepository->create($data);
    }

    /**
     * Update a FAQ.
     */
    public function update(Faq $faq, array $data): Faq
    {
        $this->faqRepository->update($faq->id, $data);
        return $faq->fresh();
    }

    /**
     * Delete a FAQ.
     */
    public function delete(Faq $faq): bool
    {
        return $this->faqRepository->deleteById($faq->id);
    }

    /**
     * Reorder FAQs.
     */
    public function reorder(array $orderedIds): void
    {
        foreach ($orderedIds as $order => $id) {
            $faq = $this->faqRepository->findById($id);
            if ($faq) {
                $this->faqRepository->update($id, ['order' => $order]);
            }
        }
    }

    /**
     * Toggle FAQ published status.
     */
    public function togglePublished(Faq $faq): Faq
    {
        $this->faqRepository->update($faq->id, [
            'is_published' => !$faq->is_published,
        ]);
        return $faq->fresh();
    }

    /**
     * Bulk delete FAQs.
     */
    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            if ($this->faqRepository->deleteById($id)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Duplicate a FAQ.
     */
    public function duplicate(Faq $faq): Faq
    {
        $data = $faq->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $data['question'] = $data['question'] . ' (Copy)';
        $data['is_published'] = false;
        $data['order'] = Faq::max('order') + 1;

        return $this->faqRepository->create($data);
    }
}
