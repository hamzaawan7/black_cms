<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Role constants
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_TENANT_ADMIN = 'tenant_admin';
    public const ROLE_EDITOR = 'editor';
    public const ROLE_VIEWER = 'viewer';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'tenant_id',
        'role',
        'avatar',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the tenant that owns this user.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is a tenant admin.
     */
    public function isTenantAdmin(): bool
    {
        return $this->role === 'tenant_admin';
    }

    /**
     * Check if user is an editor.
     */
    public function isEditor(): bool
    {
        return $this->role === 'editor';
    }

    /**
     * Check if user can edit content.
     */
    public function canEdit(): bool
    {
        return in_array($this->role, ['super_admin', 'tenant_admin', 'editor']);
    }

    /**
     * Check if user can manage settings.
     */
    public function canManageSettings(): bool
    {
        return in_array($this->role, ['super_admin', 'tenant_admin']);
    }

    /**
     * Get the active tenant ID for this user.
     * Super admins can switch tenants via session.
     */
    public function getActiveTenantId(): ?int
    {
        // Super admin can switch tenants via session
        if ($this->isSuperAdmin() && session()->has('active_tenant_id')) {
            return session('active_tenant_id');
        }
        
        return $this->tenant_id;
    }

    /**
     * Get the active tenant for this user.
     */
    public function getActiveTenant(): ?Tenant
    {
        $tenantId = $this->getActiveTenantId();
        return $tenantId ? Tenant::find($tenantId) : null;
    }

    /**
     * Switch to a different tenant (super_admin only).
     */
    public function switchTenant(int $tenantId): bool
    {
        if (!$this->isSuperAdmin()) {
            return false;
        }

        // Verify tenant exists
        $tenant = Tenant::find($tenantId);
        if (!$tenant) {
            return false;
        }

        session(['active_tenant_id' => $tenantId]);
        return true;
    }

    /**
     * Reset to own tenant.
     */
    public function resetTenant(): void
    {
        session()->forget('active_tenant_id');
    }
}
