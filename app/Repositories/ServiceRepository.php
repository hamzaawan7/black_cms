<?php

namespace App\Repositories;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Service Repository Implementation
 */
class ServiceRepository extends BaseRepository implements ServiceRepositoryInterface
{
    /**
     * Searchable columns for this entity.
     *
     * @var array
     */
    protected array $searchableColumns = ['name', 'description', 'headline', 'slug'];

    /**
     * Create a new repository instance.
     *
     * @param Service $model
     */
    public function __construct(Service $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getPublished(array $relations = []): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->with($relations)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getPopular(int $limit = 6, array $relations = []): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->where('is_popular', true)
            ->with($relations)
            ->orderBy('order')
            ->limit($limit)
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByCategory(int $categoryId, array $relations = []): Collection
    {
        return $this->query()
            ->where('category_id', $categoryId)
            ->where('is_published', true)
            ->with($relations)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getGroupedByCategory(): Collection
    {
        return ServiceCategory::query()
            ->where('is_active', true)
            ->with(['services' => function ($query) {
                $query->where('is_published', true)->orderBy('order');
            }])
            ->orderBy('order')
            ->get();
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
     * {@inheritDoc}
     */
    public function togglePublish(int $serviceId): bool
    {
        $service = $this->findById($serviceId);

        if (!$service) {
            return false;
        }

        $service->is_published = !$service->is_published;
        return $service->save();
    }

    /**
     * {@inheritDoc}
     */
    public function togglePopular(int $serviceId): bool
    {
        $service = $this->findById($serviceId);

        if (!$service) {
            return false;
        }

        $service->is_popular = !$service->is_popular;
        return $service->save();
    }

    /**
     * Get services with advanced filtering.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = $this->query()->with(['category']);

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, $this->searchableColumns);
        }

        return $query->orderBy('order')->paginate($perPage);
    }
}
