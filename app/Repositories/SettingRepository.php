<?php

namespace App\Repositories;

use App\Models\Setting;
use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Setting Repository Implementation
 */
class SettingRepository extends BaseRepository implements SettingRepositoryInterface
{
    /**
     * Cache key prefix.
     *
     * @var string
     */
    protected string $cachePrefix = 'settings:';

    /**
     * Cache TTL in seconds.
     *
     * @var int
     */
    protected int $cacheTtl = 3600;

    /**
     * Create a new repository instance.
     *
     * @param Setting $model
     */
    public function __construct(Setting $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getValue(string $key, mixed $default = null): mixed
    {
        $cacheKey = $this->cachePrefix . $key;

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($key, $default) {
            $setting = $this->findBy('key', $key);
            return $setting ? $this->castValue($setting->value, $setting->type) : $default;
        });
    }

    /**
     * {@inheritDoc}
     */
    public function setValue(string $key, mixed $value, string $group = 'general'): bool
    {
        $setting = $this->updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'group' => $group,
                'type' => $this->detectType($value),
            ]
        );

        // Clear cache
        Cache::forget($this->cachePrefix . $key);
        Cache::forget($this->cachePrefix . 'all');

        return $setting->exists;
    }

    /**
     * {@inheritDoc}
     */
    public function getByGroup(string $group): Collection
    {
        return $this->query()
            ->where('group', $group)
            ->orderBy('key')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getGroups(): array
    {
        return $this->query()
            ->distinct()
            ->pluck('group')
            ->filter()
            ->values()
            ->toArray();
    }

    /**
     * {@inheritDoc}
     */
    public function getAllAsArray(): array
    {
        $cacheKey = $this->cachePrefix . 'all';

        return Cache::remember($cacheKey, $this->cacheTtl, function () {
            return $this->all()
                ->mapWithKeys(function ($setting) {
                    return [$setting->key => $this->castValue($setting->value, $setting->type)];
                })
                ->toArray();
        });
    }

    /**
     * {@inheritDoc}
     */
    public function bulkUpdate(array $settings): bool
    {
        return $this->transaction(function () use ($settings) {
            foreach ($settings as $key => $value) {
                $group = 'general';

                // Check if value is array with group
                if (is_array($value) && isset($value['value'])) {
                    $group = $value['group'] ?? 'general';
                    $value = $value['value'];
                }

                $this->setValue($key, $value, $group);
            }
            return true;
        });
    }

    /**
     * Cast value to appropriate type.
     *
     * @param mixed $value
     * @param string|null $type
     * @return mixed
     */
    protected function castValue(mixed $value, ?string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'array', 'json' => is_string($value) ? json_decode($value, true) : $value,
            default => $value,
        };
    }

    /**
     * Detect value type.
     *
     * @param mixed $value
     * @return string
     */
    protected function detectType(mixed $value): string
    {
        return match (true) {
            is_bool($value) => 'boolean',
            is_int($value) => 'integer',
            is_float($value) => 'float',
            is_array($value) => 'json',
            default => 'string',
        };
    }

    /**
     * Clear all settings cache.
     *
     * @return void
     */
    public function clearCache(): void
    {
        $settings = $this->all();

        foreach ($settings as $setting) {
            Cache::forget($this->cachePrefix . $setting->key);
        }

        Cache::forget($this->cachePrefix . 'all');
    }
}
