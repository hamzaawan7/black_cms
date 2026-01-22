<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'author_name',
        'author_title',
        'author_image',
        'content',
        'rating',
        'is_featured',
        'is_published',
        'order',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Scope a query to only include published testimonials.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to only include featured testimonials.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
