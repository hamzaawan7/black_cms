<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentVersion extends Model
{
    protected $fillable = [
        'tenant_id',
        'versionable_type',
        'versionable_id',
        'version_number',
        'content',
        'user_id',
        'user_name',
        'reason',
        'is_current',
    ];

    protected $casts = [
        'content' => 'array',
        'is_current' => 'boolean',
    ];

    /**
     * Get the versionable model.
     */
    public function versionable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who created this version.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tenant.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Create a new version for a model.
     */
    public static function createVersion(Model $model, ?string $reason = null): self
    {
        $user = auth()->user();
        
        // Get the latest version number
        $latestVersion = self::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->id)
            ->max('version_number') ?? 0;

        // Mark all previous versions as not current
        self::where('versionable_type', get_class($model))
            ->where('versionable_id', $model->id)
            ->update(['is_current' => false]);

        return self::create([
            'tenant_id' => $model->tenant_id ?? $user?->tenant_id,
            'versionable_type' => get_class($model),
            'versionable_id' => $model->id,
            'version_number' => $latestVersion + 1,
            'content' => $model->toArray(),
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'reason' => $reason,
            'is_current' => true,
        ]);
    }

    /**
     * Restore a model to this version.
     */
    public function restore(): bool
    {
        $model = $this->versionable;
        
        if (!$model) {
            return false;
        }

        // Get the content, excluding id, timestamps, and relations
        $content = collect($this->content)
            ->except(['id', 'created_at', 'updated_at', 'deleted_at'])
            ->toArray();

        $model->fill($content);
        $result = $model->save();

        if ($result) {
            // Create a new version marking this as a restore
            self::createVersion($model, "Restored from version {$this->version_number}");
        }

        return $result;
    }

    /**
     * Scope for a specific model.
     */
    public function scopeForModel($query, Model $model)
    {
        return $query
            ->where('versionable_type', get_class($model))
            ->where('versionable_id', $model->id);
    }
}
