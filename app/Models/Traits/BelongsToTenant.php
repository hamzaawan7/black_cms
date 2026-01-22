<?php

namespace App\Models\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToTenant(): void
    {
        // Automatically set tenant_id when creating a new record
        static::creating(function ($model) {
            if (!$model->tenant_id) {
                // Try to get tenant from authenticated user
                if (auth()->check() && auth()->user()->tenant_id) {
                    $model->tenant_id = auth()->user()->tenant_id;
                }
                // Try to get tenant from request attributes (set by TenantMiddleware)
                elseif (request()->attributes->has('tenant_id')) {
                    $model->tenant_id = request()->attributes->get('tenant_id');
                }
                // Try to get from app container
                elseif (app()->bound('current_tenant')) {
                    $model->tenant_id = app('current_tenant')->id;
                }
            }
        });

        // Add global scope to filter by tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = static::getCurrentTenantId();
            
            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
    }

    /**
     * Get the current tenant ID from various sources.
     */
    protected static function getCurrentTenantId(): ?int
    {
        // From authenticated user
        if (auth()->check() && auth()->user()->tenant_id) {
            return auth()->user()->tenant_id;
        }

        // From request attributes (set by TenantMiddleware for API)
        if (request()->attributes->has('tenant_id')) {
            return request()->attributes->get('tenant_id');
        }

        // From app container
        if (app()->bound('current_tenant')) {
            return app('current_tenant')->id;
        }

        return null;
    }

    /**
     * Get the tenant that owns this model.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope a query to a specific tenant.
     */
    public function scopeForTenant(Builder $query, int|Tenant $tenant): Builder
    {
        $tenantId = $tenant instanceof Tenant ? $tenant->id : $tenant;
        return $query->where($this->getTable() . '.tenant_id', $tenantId);
    }

    /**
     * Scope to ignore the tenant global scope.
     */
    public function scopeWithoutTenantScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('tenant');
    }
}
