<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    /**
     * Default styles structure to ensure consistency.
     */
    protected function getDefaultStyles(): array
    {
        return [
            'background_color' => null,
            'text_color' => null,
            'heading_color' => null,
            'font_size' => 'base',
            'padding_top' => 'lg',
            'padding_bottom' => 'lg',
            'container_width' => 'default',
            'custom_css_class' => '',
        ];
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ensure styles is always an object with default values
        $styles = is_array($this->styles) && !empty($this->styles) 
            ? array_merge($this->getDefaultStyles(), $this->styles)
            : $this->getDefaultStyles();

        return [
            'id' => $this->id,
            'component_type' => $this->component_type,
            'order' => $this->order,
            'is_visible' => $this->is_visible,
            'content' => $this->content ?? [],
            'styles' => $styles,
            'settings' => $this->settings ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
