<?php

namespace App\Repositories;

use App\Models\Faq;
use App\Repositories\Contracts\FaqRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * FAQ Repository Implementation
 */
class FaqRepository extends BaseRepository implements FaqRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param Faq $model
     */
    public function __construct(Faq $model)
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
    public function getGroupedByCategory(bool $publishedOnly = true): Collection
    {
        $query = $this->query()->orderBy('order');

        if ($publishedOnly) {
            $query->where('is_published', true);
        }

        return $query->get()->groupBy('category');
    }

    /**
     * {@inheritDoc}
     */
    public function getCategories(): array
    {
        return $this->query()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * {@inheritDoc}
     */
    public function updateOrder(array $orderedIds): bool
    {
        return $this->transaction(function () use ($orderedIds) {
            foreach ($orderedIds as $index => $id) {
                $this->query()
                    ->where('id', $id)
                    ->update(['order' => $index]);
            }
            return true;
        });
    }

    /**
     * Get FAQs with filtering and search.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15)
    {
        $query = $this->query();

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['question', 'answer', 'category']);
        }

        return $query->orderBy('order')->paginate($perPage);
    }
}
