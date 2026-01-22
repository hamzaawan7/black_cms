<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'user_name',
        'action',
        'subject_type',
        'subject_id',
        'subject_name',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * Get the tenant that owns this activity log.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subject of the activity.
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Log an activity.
     */
    public static function log(
        string $action,
        ?Model $subject = null,
        ?array $properties = null,
        ?User $user = null
    ): self {
        $user = $user ?? auth()->user();

        return self::create([
            'tenant_id' => $user?->tenant_id,
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'subject_name' => $subject ? ($subject->title ?? $subject->name ?? null) : null,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Scope for filtering by tenant.
     */
    public function scopeForTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    /**
     * Scope for filtering by action.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for filtering by subject type.
     */
    public function scopeForSubjectType($query, string $type)
    {
        return $query->where('subject_type', $type);
    }

    /**
     * Get human-readable action label.
     */
    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'published' => 'Published',
            'unpublished' => 'Unpublished',
            'duplicated' => 'Duplicated',
            'reordered' => 'Reordered',
            'login' => 'Logged in',
            'logout' => 'Logged out',
            default => ucfirst($this->action),
        };
    }

    /**
     * Get color class for action badge.
     */
    public function getActionColorAttribute(): string
    {
        return match ($this->action) {
            'created' => 'bg-emerald-100 text-emerald-700',
            'updated' => 'bg-blue-100 text-blue-700',
            'deleted' => 'bg-red-100 text-red-700',
            'published' => 'bg-green-100 text-green-700',
            'unpublished' => 'bg-amber-100 text-amber-700',
            'duplicated' => 'bg-purple-100 text-purple-700',
            default => 'bg-gray-100 text-gray-700',
        };
    }
}
