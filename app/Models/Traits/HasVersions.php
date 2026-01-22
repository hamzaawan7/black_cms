<?php

namespace App\Models\Traits;

use App\Models\ContentVersion;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasVersions
{
    /**
     * Boot the trait.
     */
    public static function bootHasVersions(): void
    {
        // Create version after model is updated
        static::updated(function ($model) {
            if ($model->shouldCreateVersion()) {
                ContentVersion::createVersion($model);
            }
        });
    }

    /**
     * Determine if a version should be created.
     * Override this in your model if you need custom logic.
     */
    public function shouldCreateVersion(): bool
    {
        // Skip versioning if explicitly disabled
        if (property_exists($this, 'skipVersioning') && $this->skipVersioning) {
            return false;
        }

        // Only version if significant changes were made
        $significantFields = $this->getVersionableFields();
        
        if (empty($significantFields)) {
            return true; // Version all changes if no specific fields defined
        }

        $changedFields = array_keys($this->getChanges());
        $significantChanges = array_intersect($changedFields, $significantFields);
        
        return !empty($significantChanges);
    }

    /**
     * Get the fields that should trigger versioning.
     * Override this in your model to specify fields.
     */
    public function getVersionableFields(): array
    {
        return property_exists($this, 'versionableFields') 
            ? $this->versionableFields 
            : [];
    }

    /**
     * Get all versions for this model.
     */
    public function versions(): MorphMany
    {
        return $this->morphMany(ContentVersion::class, 'versionable')
            ->orderBy('version_number', 'desc');
    }

    /**
     * Get the current version.
     */
    public function currentVersion(): ?ContentVersion
    {
        return $this->versions()->where('is_current', true)->first();
    }

    /**
     * Get the latest version number.
     */
    public function getLatestVersionNumber(): int
    {
        return $this->versions()->max('version_number') ?? 0;
    }

    /**
     * Create an initial version (call this on create).
     */
    public function createInitialVersion(?string $reason = null): ContentVersion
    {
        return ContentVersion::createVersion($this, $reason ?? 'Initial version');
    }

    /**
     * Create a manual version with a reason.
     */
    public function createVersion(string $reason): ContentVersion
    {
        return ContentVersion::createVersion($this, $reason);
    }

    /**
     * Restore to a specific version.
     */
    public function restoreToVersion(int $versionNumber): bool
    {
        $version = $this->versions()
            ->where('version_number', $versionNumber)
            ->first();

        if (!$version) {
            return false;
        }

        return $version->restore();
    }

    /**
     * Get diff between two versions.
     */
    public function diffVersions(int $fromVersion, int $toVersion): array
    {
        $from = $this->versions()->where('version_number', $fromVersion)->first();
        $to = $this->versions()->where('version_number', $toVersion)->first();

        if (!$from || !$to) {
            return [];
        }

        $fromContent = $from->content;
        $toContent = $to->content;
        
        $diff = [];
        
        // Find changed fields
        foreach ($toContent as $key => $value) {
            if (!array_key_exists($key, $fromContent)) {
                $diff[$key] = ['added' => $value];
            } elseif ($fromContent[$key] !== $value) {
                $diff[$key] = ['from' => $fromContent[$key], 'to' => $value];
            }
        }
        
        // Find removed fields
        foreach ($fromContent as $key => $value) {
            if (!array_key_exists($key, $toContent)) {
                $diff[$key] = ['removed' => $value];
            }
        }
        
        return $diff;
    }

    /**
     * Temporarily disable versioning for this model instance.
     */
    public function withoutVersioning(callable $callback): mixed
    {
        $this->skipVersioning = true;
        $result = $callback($this);
        $this->skipVersioning = false;
        return $result;
    }
}
