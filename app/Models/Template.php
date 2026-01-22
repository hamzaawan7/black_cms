<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'preview_image',
        'description',
        'version',
        'is_active',
        'supported_components',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'supported_components' => 'array',
    ];

    /**
     * Get all tenants using this template.
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'active_template_id');
    }
}
