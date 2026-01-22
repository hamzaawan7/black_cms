<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use App\Models\Traits\DispatchesWebhooks;
use App\Models\Traits\HasVersions;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    use BelongsToTenant, LogsActivity, HasVersions, DispatchesWebhooks;

    /**
     * Fields that trigger versioning when changed.
     */
    protected array $versionableFields = [
        'name',
        'slug',
        'description',
        'headline',
        'pricing',
        'content',
        'is_published',
    ];

    protected $fillable = [
        'tenant_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'headline',
        'pricing',
        'get_started_url',
        'image',
        'secondary_image',
        'vial_image',
        'is_popular',
        'is_published',
        'publish_status',
        'scheduled_at',
        'order',
        'content',
        'stats',
        'benefits',
        'what_is',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_published' => 'boolean',
        'scheduled_at' => 'datetime',
        'content' => 'array',
        'stats' => 'array',
        'benefits' => 'array',
        'what_is' => 'array',
    ];

    /**
     * Get the category that owns this service.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    /**
     * Scope a query to only include published services.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to only include popular services.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }
}
