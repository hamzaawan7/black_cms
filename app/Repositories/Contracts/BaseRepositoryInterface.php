<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Base Repository Interface
 *
 * Defines the contract for all repository implementations.
 * All entity repositories should extend this interface.
 */
interface BaseRepositoryInterface
{
    /**
     * Get all records.
     *
     * @param array $columns
     * @param array $relations
     * @return Collection
     */
    public function all(array $columns = ['*'], array $relations = []): Collection;

    /**
     * Get all records with pagination.
     *
     * @param int $perPage
     * @param array $columns
     * @param array $relations
     * @return LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, array $columns = ['*'], array $relations = []): LengthAwarePaginator;

    /**
     * Find record by id.
     *
     * @param int $modelId
     * @param array $columns
     * @param array $relations
     * @param array $appends
     * @return Model|null
     */
    public function findById(
        int $modelId,
        array $columns = ['*'],
        array $relations = [],
        array $appends = []
    ): ?Model;

    /**
     * Find record by custom column.
     *
     * @param string $column
     * @param mixed $value
     * @param array $columns
     * @param array $relations
     * @return Model|null
     */
    public function findBy(
        string $column,
        mixed $value,
        array $columns = ['*'],
        array $relations = []
    ): ?Model;

    /**
     * Find record by slug.
     *
     * @param string $slug
     * @param array $columns
     * @param array $relations
     * @return Model|null
     */
    public function findBySlug(
        string $slug,
        array $columns = ['*'],
        array $relations = []
    ): ?Model;

    /**
     * Get records by condition.
     *
     * @param array $conditions
     * @param array $columns
     * @param array $relations
     * @return Collection
     */
    public function getWhere(
        array $conditions,
        array $columns = ['*'],
        array $relations = []
    ): Collection;

    /**
     * Create a new record.
     *
     * @param array $payload
     * @return Model
     */
    public function create(array $payload): Model;

    /**
     * Update existing record.
     *
     * @param int $modelId
     * @param array $payload
     * @return Model
     */
    public function update(int $modelId, array $payload): Model;

    /**
     * Delete record by id.
     *
     * @param int $modelId
     * @return bool
     */
    public function deleteById(int $modelId): bool;

    /**
     * Get count of records.
     *
     * @param array $conditions
     * @return int
     */
    public function count(array $conditions = []): int;

    /**
     * Check if record exists.
     *
     * @param array $conditions
     * @return bool
     */
    public function exists(array $conditions): bool;

    /**
     * Update or create record.
     *
     * @param array $attributes
     * @param array $values
     * @return Model
     */
    public function updateOrCreate(array $attributes, array $values = []): Model;

    /**
     * Bulk insert records.
     *
     * @param array $records
     * @return bool
     */
    public function insert(array $records): bool;

    /**
     * Get records ordered by column.
     *
     * @param string $column
     * @param string $direction
     * @param array $columns
     * @param array $relations
     * @return Collection
     */
    public function orderBy(
        string $column,
        string $direction = 'asc',
        array $columns = ['*'],
        array $relations = []
    ): Collection;
}
