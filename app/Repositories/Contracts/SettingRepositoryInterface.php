<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

/**
 * Setting Repository Interface
 */
interface SettingRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function getValue(string $key, mixed $default = null): mixed;

    /**
     * Set setting value.
     *
     * @param string $key
     * @param mixed $value
     * @param string $group
     * @return bool
     */
    public function setValue(string $key, mixed $value, string $group = 'general'): bool;

    /**
     * Get settings by group.
     *
     * @param string $group
     * @return Collection
     */
    public function getByGroup(string $group): Collection;

    /**
     * Get all groups.
     *
     * @return array
     */
    public function getGroups(): array;

    /**
     * Get all settings as key-value array.
     *
     * @return array
     */
    public function getAllAsArray(): array;

    /**
     * Bulk update settings.
     *
     * @param array $settings
     * @return bool
     */
    public function bulkUpdate(array $settings): bool;
}
