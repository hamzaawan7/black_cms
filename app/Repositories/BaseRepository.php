<?php

namespace App\Repositories;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Base Repository Implementation
 *
 * Provides common CRUD operations for all repositories.
 * All entity repositories should extend this class.
 */
abstract class BaseRepository implements BaseRepositoryInterface
{
    /**
     * The model instance.
     *
     * @var Model
     */
    protected Model $model;

    /**
     * Create a new repository instance.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get the model instance.
     *
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }

    /**
     * Get a new query builder for the model.
     *
     * @return Builder
     */
    protected function query(): Builder
    {
        return $this->model->newQuery();
    }

    /**
     * {@inheritDoc}
     */
    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        return $this->query()
            ->with($relations)
            ->get($columns);
    }

    /**
     * {@inheritDoc}
     */
    public function paginate(int $perPage = 15, array $columns = ['*'], array $relations = []): LengthAwarePaginator
    {
        return $this->query()
            ->with($relations)
            ->paginate($perPage, $columns);
    }

    /**
     * {@inheritDoc}
     */
    public function findById(
        int $modelId,
        array $columns = ['*'],
        array $relations = [],
        array $appends = []
    ): ?Model {
        $model = $this->query()
            ->select($columns)
            ->with($relations)
            ->find($modelId);

        if ($model && count($appends) > 0) {
            $model->append($appends);
        }

        return $model;
    }

    /**
     * {@inheritDoc}
     */
    public function findBy(
        string $column,
        mixed $value,
        array $columns = ['*'],
        array $relations = []
    ): ?Model {
        return $this->query()
            ->select($columns)
            ->with($relations)
            ->where($column, $value)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function findBySlug(
        string $slug,
        array $columns = ['*'],
        array $relations = []
    ): ?Model {
        return $this->findBy('slug', $slug, $columns, $relations);
    }

    /**
     * {@inheritDoc}
     */
    public function getWhere(
        array $conditions,
        array $columns = ['*'],
        array $relations = []
    ): Collection {
        $query = $this->query()->select($columns)->with($relations);

        foreach ($conditions as $column => $value) {
            if (is_array($value)) {
                $query->whereIn($column, $value);
            } else {
                $query->where($column, $value);
            }
        }

        return $query->get();
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $payload): Model
    {
        return $this->query()->create($payload);
    }

    /**
     * {@inheritDoc}
     */
    public function update(int $modelId, array $payload): Model
    {
        $model = $this->findById($modelId);

        if (!$model) {
            throw new \InvalidArgumentException("Model with ID {$modelId} not found");
        }

        $model->update($payload);

        return $model->fresh();
    }

    /**
     * {@inheritDoc}
     */
    public function deleteById(int $modelId): bool
    {
        $model = $this->findById($modelId);

        if (!$model) {
            return false;
        }

        return $model->delete();
    }

    /**
     * {@inheritDoc}
     */
    public function count(array $conditions = []): int
    {
        $query = $this->query();

        foreach ($conditions as $column => $value) {
            if (is_array($value)) {
                $query->whereIn($column, $value);
            } else {
                $query->where($column, $value);
            }
        }

        return $query->count();
    }

    /**
     * {@inheritDoc}
     */
    public function exists(array $conditions): bool
    {
        $query = $this->query();

        foreach ($conditions as $column => $value) {
            $query->where($column, $value);
        }

        return $query->exists();
    }

    /**
     * {@inheritDoc}
     */
    public function updateOrCreate(array $attributes, array $values = []): Model
    {
        return $this->query()->updateOrCreate($attributes, $values);
    }

    /**
     * {@inheritDoc}
     */
    public function insert(array $records): bool
    {
        return $this->query()->insert($records);
    }

    /**
     * {@inheritDoc}
     */
    public function orderBy(
        string $column,
        string $direction = 'asc',
        array $columns = ['*'],
        array $relations = []
    ): Collection {
        return $this->query()
            ->select($columns)
            ->with($relations)
            ->orderBy($column, $direction)
            ->get();
    }

    /**
     * Begin a database transaction.
     *
     * @return void
     */
    protected function beginTransaction(): void
    {
        DB::beginTransaction();
    }

    /**
     * Commit the database transaction.
     *
     * @return void
     */
    protected function commit(): void
    {
        DB::commit();
    }

    /**
     * Rollback the database transaction.
     *
     * @return void
     */
    protected function rollback(): void
    {
        DB::rollBack();
    }

    /**
     * Execute callback within a transaction.
     *
     * @param callable $callback
     * @return mixed
     */
    protected function transaction(callable $callback): mixed
    {
        return DB::transaction($callback);
    }

    /**
     * Apply filters to query.
     *
     * @param Builder $query
     * @param array $filters
     * @return Builder
     */
    protected function applyFilters(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $value) {
            if ($value === null) {
                continue;
            }

            match (true) {
                is_array($value) => $query->whereIn($field, $value),
                is_bool($value) => $query->where($field, $value),
                default => $query->where($field, $value),
            };
        }

        return $query;
    }

    /**
     * Apply search to query.
     *
     * @param Builder $query
     * @param string $search
     * @param array $searchableColumns
     * @return Builder
     */
    protected function applySearch(Builder $query, string $search, array $searchableColumns): Builder
    {
        if (empty($search) || empty($searchableColumns)) {
            return $query;
        }

        return $query->where(function ($q) use ($search, $searchableColumns) {
            foreach ($searchableColumns as $column) {
                $q->orWhere($column, 'LIKE', "%{$search}%");
            }
        });
    }

    /**
     * Apply sorting to query.
     *
     * @param Builder $query
     * @param string $sortBy
     * @param string $sortDirection
     * @return Builder
     */
    protected function applySorting(Builder $query, string $sortBy, string $sortDirection = 'asc'): Builder
    {
        return $query->orderBy($sortBy, $sortDirection);
    }
}
