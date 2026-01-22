<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use App\Models\Traits\DispatchesWebhooks;
use App\Models\Traits\HasVersions;
use App\Models\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    use BelongsToTenant, LogsActivity, HasVersions, DispatchesWebhooks;

    /**
     * Fields that trigger versioning when changed.
     */
    protected array $versionableFields = [
        'title',
        'slug',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        'is_published',
    ];

    protected $fillable = [
        'tenant_id',
        'slug',
        'title',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'content',
        'og_image',
        'is_published',
        'published_at',
        'publish_status',
        'scheduled_at',
        'order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'content' => 'json',
    ];

    /**
     * Get all sections for this page.
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('order');
    }

    /**
     * Scope a query to only include published pages.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
