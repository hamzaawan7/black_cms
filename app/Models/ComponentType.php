<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class ComponentType extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'description',
        'icon',
        'fields',
        'default_content',
        'default_styles',
        'is_active',
        'is_system',
        'order',
    ];

    protected $casts = [
        'fields' => 'array',
        'default_content' => 'array',
        'default_styles' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    /**
     * Available field types for component fields.
     */
    public const FIELD_TYPES = [
        'text' => 'Text Input',
        'textarea' => 'Text Area',
        'richtext' => 'Rich Text Editor',
        'number' => 'Number',
        'select' => 'Dropdown Select',
        'checkbox' => 'Checkbox',
        'toggle' => 'Toggle Switch',
        'media' => 'Media/Image',
        'color' => 'Color Picker',
        'url' => 'URL/Link',
        'repeater' => 'Repeater (Multiple Items)',
    ];

    /**
     * Get active component types for the current tenant.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Get component types including global (null tenant) ones.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        $tenantId = auth()->user()?->tenant_id;
        
        return $query->where(function ($q) use ($tenantId) {
            $q->whereNull('tenant_id'); // Global/system types
            if ($tenantId) {
                $q->orWhere('tenant_id', $tenantId); // Tenant-specific types
            }
        })->where('is_active', true);
    }

    /**
     * Get as array for section builder.
     */
    public function toComponentArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'fields' => collect($this->fields)->pluck('name')->toArray(),
            'fieldDefinitions' => $this->fields,
            'defaultContent' => $this->default_content ?? [],
            'defaultStyles' => $this->default_styles ?? [],
        ];
    }

    /**
     * Convert all component types to the format expected by section builder.
     */
    public static function toComponentTypesArray(): array
    {
        return static::available()
            ->orderBy('order')
            ->orderBy('name')
            ->get()
            ->mapWithKeys(fn ($type) => [$type->slug => $type->toComponentArray()])
            ->toArray();
    }
}
