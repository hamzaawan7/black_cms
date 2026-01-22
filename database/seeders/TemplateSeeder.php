<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Hyve Wellness',
                'slug' => 'hyve-wellness',
                'preview_image' => '/images/templates/hyve-wellness-preview.png',
                'description' => 'The flagship wellness template featuring elegant gold accents, modern typography, and a premium aesthetic perfect for health and wellness businesses.',
                'version' => '1.0.0',
                'is_active' => true,
                'supported_components' => json_encode([
                    'hero',
                    'services-grid',
                    'testimonials',
                    'team-section',
                    'faq',
                    'contact-form',
                    'pricing-table',
                    'about-section',
                    'gallery',
                    'blog-posts',
                ]),
            ],
            [
                'name' => 'Modern Medical',
                'slug' => 'modern-medical',
                'preview_image' => '/images/templates/modern-medical-preview.png',
                'description' => 'A clean, professional template designed for medical practices, clinics, and healthcare providers. Features calming blues and greens with accessible typography.',
                'version' => '1.0.0',
                'is_active' => true,
                'supported_components' => json_encode([
                    'hero',
                    'services-grid',
                    'testimonials',
                    'team-section',
                    'faq',
                    'contact-form',
                    'appointment-booking',
                    'location-map',
                ]),
            ],
            [
                'name' => 'Minimalist Spa',
                'slug' => 'minimalist-spa',
                'preview_image' => '/images/templates/minimalist-spa-preview.png',
                'description' => 'A serene, minimalist template perfect for spas, retreats, and relaxation-focused businesses. Features soft colors and ample white space.',
                'version' => '1.0.0',
                'is_active' => true,
                'supported_components' => json_encode([
                    'hero',
                    'services-grid',
                    'testimonials',
                    'gallery',
                    'pricing-table',
                    'booking-widget',
                ]),
            ],
        ];

        foreach ($templates as $template) {
            Template::updateOrCreate(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
