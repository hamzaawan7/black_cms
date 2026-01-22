<?php

namespace App\Repositories;

use App\Models\ServiceCategory;
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Service Category Repository Implementation
 */
class ServiceCategoryRepository extends BaseRepository implements ServiceCategoryRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param ServiceCategory $model
     */
    public function __construct(ServiceCategory $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getActive(array $relations = []): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->with($relations)
            ->orderBy('order')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getWithServices(bool $publishedOnly = true): Collection
    {
        $query = $this->query()
            ->where('is_active', true)
            ->with(['services' => function ($q) use ($publishedOnly) {
                if ($publishedOnly) {
                    $q->where('is_published', true);
                }
                $q->orderBy('order');
            }])
            ->orderBy('order');

        return $query->get();
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
}
