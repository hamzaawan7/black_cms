<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Section extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'page_id',
        'component_type',
        'type',
        'order',
        'is_visible',
        'content',
        'styles',
        'settings',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'content' => 'array',
        'styles' => 'array',
        'settings' => 'array',
    ];

    /**
     * Get the page that owns this section.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Scope a query to only include visible sections.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
