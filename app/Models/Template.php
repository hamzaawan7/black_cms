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
        // Deployment
        'github_repo',
        'github_branch',
        'build_command',
        'output_directory',
        'framework',
        // Defaults
        'default_settings',
        'default_colors',
        // Meta
        'category',
        'price',
        'is_premium',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
        'supported_components' => 'array',
        'default_settings' => 'array',
        'default_colors' => 'array',
        'price' => 'decimal:2',
    ];

    /**
     * Get all tenants using this template.
     */
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'active_template_id');
    }

    /**
     * Check if this template supports a specific component.
     */
    public function supportsComponent(string $component): bool
    {
        if (empty($this->supported_components)) {
            return true; // No restrictions means all components supported
        }

        return in_array($component, $this->supported_components);
    }

    /**
     * Get the template configuration for API response.
     */
    public function getConfig(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'version' => $this->version,
            'framework' => $this->framework ?? 'nextjs',
            'supported_components' => $this->supported_components ?? [],
            'default_colors' => $this->default_colors ?? [
                'primary' => '#c9a962',
                'secondary' => '#3d3d3d',
                'background' => '#f5f2eb',
            ],
        ];
    }

    /**
     * Get build configuration for deployment.
     */
    public function getBuildConfig(): array
    {
        return [
            'repo' => $this->github_repo,
            'branch' => $this->github_branch ?? 'main',
            'build_command' => $this->build_command ?? 'npm run build',
            'output_directory' => $this->output_directory ?? 'out',
            'framework' => $this->framework ?? 'nextjs',
        ];
    }
}
