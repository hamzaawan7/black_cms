<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    protected string $cacheKey = 'tenant_settings';

    /**
     * Get all settings for the current tenant.
     */
    public function getAll(): Collection
    {
        return Setting::orderBy('group')->orderBy('key')->get();
    }

    /**
     * Get settings by group.
     */
    public function getByGroup(string $group): Collection
    {
        return Setting::where('group', $group)->orderBy('key')->get();
    }

    /**
     * Get a setting value by key.
     */
    public function get(string $key, $default = null)
    {
        $setting = Setting::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Get all settings as key-value array.
     */
    public function getAllAsArray(): array
    {
        // Use resolved tenant ID from middleware, fallback to header/auth/default
        $tenantId = request()->attributes->get('tenant_id') 
            ?? request()->header('X-Tenant-ID') 
            ?? auth()->user()->tenant_id 
            ?? 1;

        $settings = Cache::remember(
            $this->cacheKey . '_' . $tenantId,
            3600,
            function () use ($tenantId) {
                return Setting::where('tenant_id', $tenantId)
                    ->pluck('value', 'key')
                    ->toArray();
            }
        );

        // Fix URLs - replace localhost with actual CMS URL
        return $this->normalizeUrls($settings);
    }

    /**
     * Normalize URLs in settings to use proper CMS base URL.
     */
    protected function normalizeUrls(array $settings): array
    {
        // Get the CMS base URL - for multi-tenant, we use a fixed CMS URL
        // In production, this should come from env CMS_URL
        $cmsBaseUrl = config('app.cms_url') ?: rtrim(config('app.url'), '/');
        
        // For local development, if it's localhost, use the actual CMS domain
        if (str_contains($cmsBaseUrl, 'localhost')) {
            // Use cms.local for local development
            $scheme = request()->isSecure() ? 'https' : 'http';
            $cmsBaseUrl = $scheme . '://cms.local';
        }
        
        // Keys that contain URLs that need normalization
        $urlKeys = ['site_logo', 'site_favicon', 'og_image', 'default_image'];
        
        foreach ($urlKeys as $key) {
            if (isset($settings[$key]) && !empty($settings[$key])) {
                $value = $settings[$key];
                
                // If it's a full URL with localhost, normalize it
                if (preg_match('#^https?://localhost(:\d+)?/#', $value)) {
                    // Convert to relative path first, then to full CMS URL
                    $relativePath = preg_replace('#^https?://localhost(:\d+)?#', '', $value);
                    $settings[$key] = $cmsBaseUrl . $relativePath;
                }
                // If it's already a relative path, prepend CMS base URL
                elseif (str_starts_with($value, '/storage/') || str_starts_with($value, '/images/')) {
                    $settings[$key] = $cmsBaseUrl . $value;
                }
            }
        }

        return $settings;
    }

    /**
     * Get settings grouped by group.
     */
    public function getGrouped(): array
    {
        return Setting::orderBy('key')
            ->get()
            ->groupBy('group')
            ->toArray();
    }

    /**
     * Set a setting value.
     */
    public function set(string $key, $value, string $group = 'general'): Setting
    {
        $tenantId = auth()->user()->tenant_id ?? 1;
        
        $setting = Setting::updateOrCreate(
            ['key' => $key, 'tenant_id' => $tenantId],
            ['value' => $value, 'group' => $group]
        );

        $this->clearCache();

        return $setting;
    }

    /**
     * Bulk update settings.
     */
    public function bulkUpdate(array $settings): bool
    {
        foreach ($settings as $setting) {
            $this->set(
                $setting['key'],
                $setting['value'],
                $setting['group'] ?? 'general'
            );
        }

        $this->clearCache();

        return true;
    }

    /**
     * Delete a setting.
     */
    public function delete(string $key): bool
    {
        $result = Setting::where('key', $key)->delete();
        $this->clearCache();

        return $result > 0;
    }

    /**
     * Clear the settings cache.
     */
    public function clearCache(): void
    {
        $tenantId = auth()->user()->tenant_id ?? null;

        if ($tenantId) {
            Cache::forget($this->cacheKey . '_' . $tenantId);
        }
    }

    /**
     * Get available setting groups.
     */
    public function getGroups(): array
    {
        return [
            'general' => 'General Settings',
            'appearance' => 'Appearance',
            'contact' => 'Contact Information',
            'social' => 'Social Media',
            'seo' => 'SEO Settings',
            'integrations' => 'Integrations',
        ];
    }

    /**
     * Get default settings array.
     */
    public function getDefaults(): array
    {
        return [
            // General/Branding
            ['key' => 'site_name', 'value' => 'Hyve Wellness', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Premium Peptide Therapy & Telehealth', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Experience personalized peptide therapy from the comfort of your home. Weight loss, anti-aging, hormone optimization and more.', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => '/images/logo.png', 'group' => 'general'],
            ['key' => 'site_favicon', 'value' => '/images/favicon.ico', 'group' => 'general'],
            
            // Appearance
            ['key' => 'primary_color', 'value' => '#9a8b7a', 'group' => 'appearance'],
            ['key' => 'secondary_color', 'value' => '#3d3d3d', 'group' => 'appearance'],
            ['key' => 'background_color', 'value' => '#f5f2eb', 'group' => 'appearance'],
            ['key' => 'font_heading', 'value' => 'Playfair Display', 'group' => 'appearance'],
            ['key' => 'font_body', 'value' => 'Inter', 'group' => 'appearance'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'hello@hyvewellness.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '1-800-HYVE-RX', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => '123 Wellness Street, Suite 100, Austin, TX 78701', 'group' => 'contact'],
            ['key' => 'business_hours', 'value' => 'Mon-Fri: 9am-6pm CST', 'group' => 'contact'],
            
            // Social
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/hyvewellness', 'group' => 'social'],
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/hyvewellness', 'group' => 'social'],
            ['key' => 'social_twitter', 'value' => 'https://twitter.com/hyvewellness', 'group' => 'social'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/hyvewellness', 'group' => 'social'],
            ['key' => 'social_youtube', 'value' => 'https://youtube.com/@hyvewellness', 'group' => 'social'],
            
            // SEO
            ['key' => 'seo_title', 'value' => 'Hyve Wellness - Premium Peptide Therapy & Telehealth', 'group' => 'seo'],
            ['key' => 'seo_description', 'value' => 'Experience personalized peptide therapy from the comfort of your home. FDA-approved treatments for weight loss, anti-aging, hormone optimization and more.', 'group' => 'seo'],
            ['key' => 'seo_keywords', 'value' => 'peptide therapy, semaglutide, tirzepatide, weight loss, telehealth, anti-aging, hormone optimization', 'group' => 'seo'],
            ['key' => 'google_analytics_id', 'value' => '', 'group' => 'seo'],
            
            // Integrations
            ['key' => 'workflow_base_url', 'value' => 'https://intake.hyvewellness.com', 'group' => 'integrations'],
            ['key' => 'patient_login_url', 'value' => 'https://hyve.tryvitalcare.com/login', 'group' => 'integrations'],
            ['key' => 'get_started_url', 'value' => 'https://hyve.tryvitalcare.com/get-started', 'group' => 'integrations'],
            ['key' => 'chat_widget_enabled', 'value' => 'true', 'group' => 'integrations'],
        ];
    }

    /**
     * Initialize default settings for a new tenant.
     */
    public function initializeDefaults(): void
    {
        $tenantId = auth()->user()->tenant_id ?? 1;

        foreach ($this->getDefaults() as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key'], 'tenant_id' => $tenantId],
                ['value' => $setting['value'], 'group' => $setting['group']]
            );
        }

        $this->clearCache();
    }

    /**
     * Reset settings to defaults.
     */
    public function resetToDefaults(): void
    {
        $tenantId = auth()->user()->tenant_id ?? 1;

        // Delete all existing settings for this tenant
        Setting::where('tenant_id', $tenantId)->delete();

        // Re-initialize with defaults
        $this->initializeDefaults();
    }
}
