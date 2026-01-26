<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Tenant extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'domain',
        'additional_domains',
        'logo',
        'favicon',
        'active_template_id',
        'settings',
        'is_active',
        // Deployment
        'api_base_url',
        'frontend_url',
        'deployment_status',
        'deployed_at',
        // Branding
        'primary_color',
        'secondary_color',
        'background_color',
        // Contact
        'contact_email',
        'contact_phone',
        'contact_address',
        'business_hours',
        'social_links',
        // SEO
        'meta_title',
        'meta_description',
        'meta_keywords',
        // API
        'api_key',
        'api_key_expires_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'additional_domains' => 'array',
        'social_links' => 'array',
        'is_active' => 'boolean',
        'deployed_at' => 'datetime',
        'api_key_expires_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tenant) {
            // Auto-generate API key if not set
            if (empty($tenant->api_key)) {
                $tenant->api_key = 'tk_' . Str::random(32);
            }
        });
    }

    /**
     * Find tenant by domain (primary or additional).
     */
    public static function findByDomain(string $domain): ?self
    {
        // First check primary domain
        $tenant = static::where('domain', $domain)->first();
        
        if ($tenant) {
            return $tenant;
        }
        
        // Check additional domains
        return static::whereJsonContains('additional_domains', $domain)->first();
    }

    /**
     * Check if this tenant owns the given domain.
     */
    public function ownsDomain(string $domain): bool
    {
        if ($this->domain === $domain) {
            return true;
        }
        
        return in_array($domain, $this->additional_domains ?? []);
    }

    /**
     * Get all domains for this tenant.
     */
    public function getAllDomains(): array
    {
        $domains = $this->additional_domains ?? [];
        
        if ($this->domain) {
            array_unshift($domains, $this->domain);
        }
        
        return $domains;
    }

    /**
     * Generate a new API key.
     */
    public function regenerateApiKey(): string
    {
        $this->api_key = 'tk_' . Str::random(32);
        $this->api_key_expires_at = null;
        $this->save();
        
        return $this->api_key;
    }

    /**
     * Get the complete site configuration for frontend.
     */
    public function getSiteConfig(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'domain' => $this->domain,
            'logo' => $this->logo,
            'favicon' => $this->favicon,
            'template' => $this->activeTemplate ? [
                'id' => $this->activeTemplate->id,
                'slug' => $this->activeTemplate->slug,
                'name' => $this->activeTemplate->name,
            ] : null,
            'branding' => [
                'primary_color' => $this->primary_color ?? '#c9a962',
                'secondary_color' => $this->secondary_color ?? '#3d3d3d',
                'background_color' => $this->background_color ?? '#f5f2eb',
            ],
            'contact' => [
                'email' => $this->contact_email,
                'phone' => $this->contact_phone,
                'address' => $this->contact_address,
                'business_hours' => $this->business_hours,
            ],
            'social_links' => $this->social_links ?? [],
            'seo' => [
                'title' => $this->meta_title ?? $this->name,
                'description' => $this->meta_description,
                'keywords' => $this->meta_keywords,
            ],
            'api_base_url' => $this->api_base_url,
            'is_active' => $this->is_active,
        ];
    }

    /**
     * Get the active template for the tenant.
     */
    public function activeTemplate(): BelongsTo
    {
        return $this->belongsTo(Template::class, 'active_template_id');
    }

    /**
     * Get all users belonging to this tenant.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all pages belonging to this tenant.
     */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    /**
     * Get all service categories belonging to this tenant.
     */
    public function serviceCategories(): HasMany
    {
        return $this->hasMany(ServiceCategory::class);
    }

    /**
     * Get all services belonging to this tenant.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get all media belonging to this tenant.
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    /**
     * Get all menus belonging to this tenant.
     */
    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Get all settings belonging to this tenant.
     */
    public function tenantSettings(): HasMany
    {
        return $this->hasMany(Setting::class);
    }

    /**
     * Get all FAQs belonging to this tenant.
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class);
    }

    /**
     * Get all testimonials belonging to this tenant.
     */
    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    /**
     * Get all team members belonging to this tenant.
     */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }
}
