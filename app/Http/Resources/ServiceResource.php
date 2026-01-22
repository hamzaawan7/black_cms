<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
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
            'category_id' => $this->category_id, // For edit form pre-selection
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'headline' => $this->headline,
            'pricing' => $this->pricing,
            'get_started_url' => $this->get_started_url,
            'image' => $this->image,
            'secondary_image' => $this->secondary_image,
            'vial_image' => $this->vial_image,
            'is_popular' => $this->is_popular,
            'is_published' => $this->is_published,
            'is_active' => $this->is_published, // Alias for frontend compatibility
            'order' => $this->order,
            'content' => $this->content,
            'stats' => $this->stats,
            'benefits' => $this->benefits,
            'what_is' => $this->what_is,
            'category' => new ServiceCategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
