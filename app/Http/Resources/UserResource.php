<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User Resource
 * 
 * Transforms User model into a consistent API response format.
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'role_label' => $this->getRoleLabel(),
            'tenant_id' => $this->tenant_id,
            'tenant' => $this->when($this->relationLoaded('tenant'), function () {
                return $this->tenant ? [
                    'id' => $this->tenant->id,
                    'name' => $this->tenant->name,
                    'slug' => $this->tenant->slug,
                ] : null;
            }),
            'avatar' => $this->avatar,
            'avatar_url' => $this->getAvatarUrl(),
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Get human-readable role label.
     *
     * @return string
     */
    protected function getRoleLabel(): string
    {
        return match ($this->role) {
            'super_admin' => 'Super Admin',
            'tenant_admin' => 'Tenant Admin',
            'editor' => 'Editor',
            default => ucfirst($this->role ?? 'Unknown'),
        };
    }

    /**
     * Get full avatar URL or default.
     *
     * @return string|null
     */
    protected function getAvatarUrl(): ?string
    {
        if ($this->avatar) {
            return $this->avatar;
        }

        // Return gravatar as fallback
        $hash = md5(strtolower(trim($this->email)));
        return "https://www.gravatar.com/avatar/{$hash}?d=mp&s=200";
    }
}
