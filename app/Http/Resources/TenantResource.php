<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
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
            'domain' => $this->domain,
            'additional_domains' => $this->additional_domains ?? [],
            'logo' => $this->logo,
            'favicon' => $this->favicon,
            'active_template_id' => $this->active_template_id,
            'settings' => $this->settings,
            'is_active' => $this->is_active,
            'users_count' => $this->users_count ?? $this->users()->count(),
            
            // Template
            'active_template' => new TemplateResource($this->whenLoaded('activeTemplate')),
            
            // Direct color fields for form binding
            'primary_color' => $this->primary_color ?? '#c9a962',
            'secondary_color' => $this->secondary_color ?? '#3d3d3d',
            'background_color' => $this->background_color ?? '#f5f2eb',
            
            // Direct contact fields for form binding
            'contact_email' => $this->contact_email,
            'contact_phone' => $this->contact_phone,
            'contact_address' => $this->contact_address,
            
            // Direct SEO fields for form binding
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            
            // Branding (nested for API consumers)
            'branding' => [
                'primary_color' => $this->primary_color ?? '#c9a962',
                'secondary_color' => $this->secondary_color ?? '#3d3d3d',
                'background_color' => $this->background_color ?? '#f5f2eb',
            ],
            
            // Contact (nested for API consumers)
            'contact' => [
                'email' => $this->contact_email,
                'phone' => $this->contact_phone,
                'address' => $this->contact_address,
                'business_hours' => $this->business_hours,
            ],
            
            // Social
            'social_links' => $this->social_links ?? [],
            
            // SEO (nested for API consumers)
            'seo' => [
                'title' => $this->meta_title ?? $this->name,
                'description' => $this->meta_description,
                'keywords' => $this->meta_keywords,
            ],
            
            // URLs
            'api_base_url' => $this->api_base_url,
            'frontend_url' => $this->frontend_url,
            
            // Status
            'deployment_status' => $this->deployment_status ?? 'pending',
            'deployed_at' => $this->deployed_at?->toISOString(),
            
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
