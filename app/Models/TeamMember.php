<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'title',
        'bio',
        'image',
        'credentials',
        'social_links',
        'order',
        'is_published',
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_published' => 'boolean',
    ];

    /**
     * Scope a query to only include published team members.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
