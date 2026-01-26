<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $settings = [
            // General/Branding Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'site_name',
                'value' => 'Hyve Wellness',
                'group' => 'general',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'site_tagline',
                'value' => 'Premium Peptide Therapy & Telehealth',
                'group' => 'general',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'site_description',
                'value' => 'Experience personalized peptide therapy from the comfort of your home. Weight loss, anti-aging, hormone optimization and more.',
                'group' => 'general',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'site_logo',
                'value' => '/images/hyve-20logo-20-20350-20x-20100-20-20charcoal.png',
                'group' => 'general',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'site_favicon',
                'value' => '/images/hyve-logo-icon.png',
                'group' => 'general',
            ],

            // Appearance Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'primary_color',
                'value' => '#9a8b7a',
                'group' => 'appearance',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'secondary_color',
                'value' => '#3d3d3d',
                'group' => 'appearance',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'background_color',
                'value' => '#f5f2eb',
                'group' => 'appearance',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'font_heading',
                'value' => 'Playfair Display',
                'group' => 'appearance',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'font_body',
                'value' => 'Inter',
                'group' => 'appearance',
            ],

            // Contact Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'contact_email',
                'value' => 'hello@hyvewellness.com',
                'group' => 'contact',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'contact_phone',
                'value' => '1-800-HYVE-RX',
                'group' => 'contact',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'contact_address',
                'value' => '123 Wellness Street, Suite 100, Austin, TX 78701',
                'group' => 'contact',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'business_hours',
                'value' => 'Mon-Fri: 9am-6pm CST',
                'group' => 'contact',
            ],

            // Social Media Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'social_facebook',
                'value' => 'https://facebook.com/hyvewellness',
                'group' => 'social',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'social_instagram',
                'value' => 'https://instagram.com/hyvewellness',
                'group' => 'social',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'social_twitter',
                'value' => 'https://twitter.com/hyvewellness',
                'group' => 'social',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'social_linkedin',
                'value' => 'https://linkedin.com/company/hyvewellness',
                'group' => 'social',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'social_youtube',
                'value' => 'https://youtube.com/@hyvewellness',
                'group' => 'social',
            ],

            // SEO Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'seo_title',
                'value' => 'Hyve Wellness - Premium Peptide Therapy & Telehealth',
                'group' => 'seo',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'seo_description',
                'value' => 'Experience personalized peptide therapy from the comfort of your home. FDA-approved treatments for weight loss, anti-aging, hormone optimization and more.',
                'group' => 'seo',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'seo_keywords',
                'value' => 'peptide therapy, semaglutide, tirzepatide, weight loss, telehealth, anti-aging, hormone optimization',
                'group' => 'seo',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'google_analytics_id',
                'value' => '',
                'group' => 'seo',
            ],

            // Integration Settings
            [
                'tenant_id' => $tenantId,
                'key' => 'workflow_base_url',
                'value' => 'https://intake.hyvewellness.com',
                'group' => 'integrations',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'patient_login_url',
                'value' => 'https://hyve.tryvitalcare.com/login',
                'group' => 'integrations',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'get_started_url',
                'value' => 'https://hyve.tryvitalcare.com/get-started',
                'group' => 'integrations',
            ],
            [
                'tenant_id' => $tenantId,
                'key' => 'chat_widget_enabled',
                'value' => 'true',
                'group' => 'integrations',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                [
                    'tenant_id' => $setting['tenant_id'],
                    'key' => $setting['key'],
                ],
                $setting
            );
        }
    }
}
