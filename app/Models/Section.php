<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Section extends Model
{
    protected $fillable = [
        'page_id',
        'component_type',
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
