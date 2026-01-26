<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TemplateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'preview_image' => $this->preview_image,
            'description' => $this->description,
            'version' => $this->version,
            'framework' => $this->framework ?? 'nextjs',
            'category' => $this->category ?? 'general',
            'is_active' => $this->is_active,
            'is_premium' => $this->is_premium ?? false,
            'price' => $this->price ?? 0,
            'supported_components' => $this->supported_components,
            'default_colors' => $this->default_colors ?? [
                'primary' => '#c9a962',
                'secondary' => '#3d3d3d',
                'background' => '#f5f2eb',
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
