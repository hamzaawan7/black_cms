<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Template;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Multi-Tenant Seeder
 * 
 * Creates additional tenants for testing multi-tenant functionality:
 * - modern-medical: Medical clinic theme (blue/green)
 * - minimalist-spa: Spa/wellness theme (soft pinks/whites)
 */
class MultiTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createModernMedicalTenant();
        $this->createMinimalistSpaTenant();
    }

    /**
     * Create Modern Medical tenant with blue/green theme.
     */
    protected function createModernMedicalTenant(): void
    {
        // Get or create template
        $template = Template::updateOrCreate(
            ['slug' => 'modern-medical'],
            [
                'name' => 'Modern Medical',
                'description' => 'Clean, professional template for medical practices',
                'preview_image' => '/images/templates/modern-medical-preview.png',
                'version' => '1.0.0',
                'supported_components' => [
                    'hero',
                    'services-grid',
                    'testimonials',
                    'team-section',
                    'faq',
                    'contact-form',
                    'appointment-booking',
                    'location-map',
                ],
                'is_active' => true,
            ]
        );

        // Create tenant
        $tenant = Tenant::updateOrCreate(
            ['slug' => 'modern-medical'],
            [
                'name' => 'Modern Medical Clinic',
                'domain' => 'medical.hyve.com',
                'active_template_id' => $template->id,
                'settings' => [
                    'company_name' => 'Modern Medical Clinic',
                    'tagline' => 'Advanced Healthcare Solutions',
                ],
                'is_active' => true,
            ]
        );

        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@modernmedical.com'],
            [
                'name' => 'Medical Admin',
                'password' => Hash::make('password'),
                'tenant_id' => $tenant->id,
                'role' => 'tenant_admin',
                'email_verified_at' => now(),
            ]
        );

        // Create theme settings (blue/teal medical theme)
        $this->createSettings($tenant->id, [
            // General
            ['key' => 'site_name', 'value' => 'Modern Medical Clinic', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Advanced Healthcare Solutions', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Comprehensive medical care with cutting-edge technology and compassionate professionals.', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => '/images/medical-logo.png', 'group' => 'general'],
            ['key' => 'site_favicon', 'value' => '/images/medical-favicon.ico', 'group' => 'general'],
            
            // Appearance (Blue/Teal Medical Theme)
            ['key' => 'primary_color', 'value' => '#0891b2', 'group' => 'appearance'], // Cyan-600
            ['key' => 'secondary_color', 'value' => '#164e63', 'group' => 'appearance'], // Cyan-900
            ['key' => 'accent_color', 'value' => '#14b8a6', 'group' => 'appearance'], // Teal-500
            ['key' => 'background_color', 'value' => '#f0fdfa', 'group' => 'appearance'], // Teal-50
            ['key' => 'text_color', 'value' => '#134e4a', 'group' => 'appearance'], // Teal-900
            ['key' => 'font_heading', 'value' => 'Montserrat', 'group' => 'appearance'],
            ['key' => 'font_body', 'value' => 'Open Sans', 'group' => 'appearance'],
            ['key' => 'border_radius', 'value' => '8px', 'group' => 'appearance'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'info@modernmedical.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '1-888-MED-CARE', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => '500 Medical Center Drive, Houston, TX 77001', 'group' => 'contact'],
            
            // Social
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/modernmedical', 'group' => 'social'],
            ['key' => 'social_linkedin', 'value' => 'https://linkedin.com/company/modernmedical', 'group' => 'social'],
            ['key' => 'social_twitter', 'value' => 'https://twitter.com/modernmedical', 'group' => 'social'],
            
            // Integrations
            ['key' => 'patient_login_url', 'value' => 'https://portal.modernmedical.com/login', 'group' => 'integrations'],
            ['key' => 'get_started_url', 'value' => 'https://portal.modernmedical.com/register', 'group' => 'integrations'],
        ]);

        // Create service categories
        $categories = $this->createServiceCategories($tenant->id, [
            ['name' => 'Primary Care', 'slug' => 'primary-care', 'description' => 'Comprehensive primary care services'],
            ['name' => 'Specialty Care', 'slug' => 'specialty-care', 'description' => 'Specialized medical treatments'],
            ['name' => 'Preventive Health', 'slug' => 'preventive-health', 'description' => 'Screenings and preventive care'],
            ['name' => 'Telemedicine', 'slug' => 'telemedicine', 'description' => 'Virtual consultations'],
        ]);

        // Create services
        $this->createServices($tenant->id, $categories, [
            ['category' => 'primary-care', 'name' => 'Annual Wellness Exam', 'slug' => 'annual-wellness-exam', 'description' => 'Comprehensive annual health assessment', 'price' => '$150'],
            ['category' => 'primary-care', 'name' => 'Sick Visit', 'slug' => 'sick-visit', 'description' => 'Same-day appointments for acute illnesses', 'price' => '$100'],
            ['category' => 'specialty-care', 'name' => 'Cardiology Consultation', 'slug' => 'cardiology-consultation', 'description' => 'Heart health evaluation and treatment', 'price' => '$250'],
            ['category' => 'preventive-health', 'name' => 'Health Screening Package', 'slug' => 'health-screening', 'description' => 'Complete blood work and screening tests', 'price' => '$299'],
            ['category' => 'telemedicine', 'name' => 'Virtual Consultation', 'slug' => 'virtual-consultation', 'description' => 'Meet with a doctor from anywhere', 'price' => '$75'],
        ]);

        // Create menus
        $this->createMenus($tenant->id);

        // Create pages
        $this->createPages($tenant->id);

        $this->command->info('✅ Modern Medical tenant created successfully');
    }

    /**
     * Create Minimalist Spa tenant with soft pink/white theme.
     */
    protected function createMinimalistSpaTenant(): void
    {
        // Get or create template
        $template = Template::updateOrCreate(
            ['slug' => 'minimalist-spa'],
            [
                'name' => 'Minimalist Spa',
                'description' => 'Serene, minimalist template for spas and retreats',
                'preview_image' => '/images/templates/minimalist-spa-preview.png',
                'version' => '1.0.0',
                'supported_components' => [
                    'hero',
                    'services-grid',
                    'testimonials',
                    'gallery',
                    'pricing-table',
                    'booking-widget',
                ],
                'is_active' => true,
            ]
        );

        // Create tenant
        $tenant = Tenant::updateOrCreate(
            ['slug' => 'minimalist-spa'],
            [
                'name' => 'Serenity Spa & Wellness',
                'domain' => 'spa.hyve.com',
                'active_template_id' => $template->id,
                'settings' => [
                    'company_name' => 'Serenity Spa & Wellness',
                    'tagline' => 'Find Your Inner Peace',
                ],
                'is_active' => true,
            ]
        );

        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@serenityspa.com'],
            [
                'name' => 'Spa Admin',
                'password' => Hash::make('password'),
                'tenant_id' => $tenant->id,
                'role' => 'tenant_admin',
                'email_verified_at' => now(),
            ]
        );

        // Create theme settings (soft pink/rose spa theme)
        $this->createSettings($tenant->id, [
            // General
            ['key' => 'site_name', 'value' => 'Serenity Spa & Wellness', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Find Your Inner Peace', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Escape the everyday and discover tranquility at Serenity Spa. Luxury treatments, expert therapists, and a peaceful atmosphere await.', 'group' => 'general'],
            ['key' => 'site_logo', 'value' => '/images/spa-logo.png', 'group' => 'general'],
            ['key' => 'site_favicon', 'value' => '/images/spa-favicon.ico', 'group' => 'general'],
            
            // Appearance (Soft Rose/Pink Spa Theme)
            ['key' => 'primary_color', 'value' => '#be185d', 'group' => 'appearance'], // Pink-700
            ['key' => 'secondary_color', 'value' => '#831843', 'group' => 'appearance'], // Pink-900
            ['key' => 'accent_color', 'value' => '#f472b6', 'group' => 'appearance'], // Pink-400
            ['key' => 'background_color', 'value' => '#fdf2f8', 'group' => 'appearance'], // Pink-50
            ['key' => 'text_color', 'value' => '#4a044e', 'group' => 'appearance'], // Fuchsia-950
            ['key' => 'font_heading', 'value' => 'Cormorant Garamond', 'group' => 'appearance'],
            ['key' => 'font_body', 'value' => 'Lato', 'group' => 'appearance'],
            ['key' => 'border_radius', 'value' => '16px', 'group' => 'appearance'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'relax@serenityspa.com', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '1-855-SPA-BLISS', 'group' => 'contact'],
            ['key' => 'contact_address', 'value' => '789 Tranquility Lane, Sedona, AZ 86336', 'group' => 'contact'],
            
            // Social
            ['key' => 'social_instagram', 'value' => 'https://instagram.com/serenityspa', 'group' => 'social'],
            ['key' => 'social_pinterest', 'value' => 'https://pinterest.com/serenityspa', 'group' => 'social'],
            ['key' => 'social_facebook', 'value' => 'https://facebook.com/serenityspa', 'group' => 'social'],
            
            // Integrations
            ['key' => 'patient_login_url', 'value' => 'https://book.serenityspa.com/login', 'group' => 'integrations'],
            ['key' => 'get_started_url', 'value' => 'https://book.serenityspa.com/appointments', 'group' => 'integrations'],
        ]);

        // Create service categories
        $categories = $this->createServiceCategories($tenant->id, [
            ['name' => 'Massage Therapy', 'slug' => 'massage-therapy', 'description' => 'Relaxing and therapeutic massages'],
            ['name' => 'Facial Treatments', 'slug' => 'facial-treatments', 'description' => 'Rejuvenating facial services'],
            ['name' => 'Body Treatments', 'slug' => 'body-treatments', 'description' => 'Full body spa experiences'],
            ['name' => 'Wellness Packages', 'slug' => 'wellness-packages', 'description' => 'Complete spa day packages'],
        ]);

        // Create services
        $this->createServices($tenant->id, $categories, [
            ['category' => 'massage-therapy', 'name' => 'Swedish Massage', 'slug' => 'swedish-massage', 'description' => 'Classic relaxation massage for stress relief', 'price' => '$120'],
            ['category' => 'massage-therapy', 'name' => 'Deep Tissue Massage', 'slug' => 'deep-tissue', 'description' => 'Targeted pressure for muscle tension', 'price' => '$150'],
            ['category' => 'massage-therapy', 'name' => 'Hot Stone Massage', 'slug' => 'hot-stone', 'description' => 'Warm stones for deep relaxation', 'price' => '$175'],
            ['category' => 'facial-treatments', 'name' => 'Signature Facial', 'slug' => 'signature-facial', 'description' => 'Customized facial for your skin type', 'price' => '$135'],
            ['category' => 'facial-treatments', 'name' => 'Anti-Aging Facial', 'slug' => 'anti-aging-facial', 'description' => 'Reduce fine lines and restore radiance', 'price' => '$195'],
            ['category' => 'body-treatments', 'name' => 'Body Scrub & Wrap', 'slug' => 'body-scrub-wrap', 'description' => 'Exfoliate and hydrate your skin', 'price' => '$180'],
            ['category' => 'wellness-packages', 'name' => 'Serenity Day Package', 'slug' => 'serenity-day', 'description' => 'Full day of relaxation including massage, facial, and lunch', 'price' => '$450'],
        ]);

        // Create menus
        $this->createMenus($tenant->id);

        // Create pages
        $this->createPages($tenant->id);

        $this->command->info('✅ Minimalist Spa tenant created successfully');
    }

    /**
     * Create settings for a tenant.
     */
    protected function createSettings(int $tenantId, array $settings): void
    {
        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['tenant_id' => $tenantId, 'key' => $setting['key']],
                array_merge($setting, ['tenant_id' => $tenantId])
            );
        }
    }

    /**
     * Create service categories for a tenant.
     */
    protected function createServiceCategories(int $tenantId, array $categories): array
    {
        $created = [];
        foreach ($categories as $index => $category) {
            $created[$category['slug']] = ServiceCategory::updateOrCreate(
                ['tenant_id' => $tenantId, 'slug' => $category['slug']],
                array_merge($category, ['tenant_id' => $tenantId, 'order' => $index])
            );
        }
        return $created;
    }

    /**
     * Create services for a tenant.
     */
    protected function createServices(int $tenantId, array $categories, array $services): void
    {
        foreach ($services as $index => $service) {
            $category = $categories[$service['category']] ?? null;
            if (!$category) continue;

            Service::updateOrCreate(
                ['tenant_id' => $tenantId, 'slug' => $service['slug']],
                [
                    'tenant_id' => $tenantId,
                    'category_id' => $category->id,
                    'name' => $service['name'],
                    'slug' => $service['slug'],
                    'description' => $service['description'],
                    'headline' => $service['name'],
                    'pricing' => $service['price'],
                    'is_popular' => $index < 3,
                    'is_published' => true,
                    'order' => $index,
                ]
            );
        }
    }

    /**
     * Create menus for a tenant.
     */
    protected function createMenus(int $tenantId): void
    {
        // Header menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'header'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Main Navigation',
                'location' => 'header',
                'items' => json_encode([
                    ['title' => 'About', 'url' => '/about', 'order' => 1],
                    ['title' => 'Services', 'url' => '/services', 'order' => 2],
                    ['title' => 'Contact', 'url' => '/contact', 'order' => 3],
                ]),
            ]
        );

        // Footer menus
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-about'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer About',
                'location' => 'footer-about',
                'items' => json_encode([
                    ['title' => 'Our Team', 'url' => '/about#team', 'order' => 1],
                    ['title' => 'Contact Us', 'url' => '/contact', 'order' => 2],
                ]),
            ]
        );

        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-legal'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer Legal',
                'location' => 'footer-legal',
                'items' => json_encode([
                    ['title' => 'Privacy Policy', 'url' => '/privacy-policy', 'order' => 1],
                    ['title' => 'Terms of Service', 'url' => '/terms-of-service', 'order' => 2],
                ]),
            ]
        );

        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'social'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Social Links',
                'location' => 'social',
                'items' => json_encode([
                    ['title' => 'Facebook', 'url' => '#', 'icon' => 'facebook', 'order' => 1],
                    ['title' => 'Instagram', 'url' => '#', 'icon' => 'instagram', 'order' => 2],
                    ['title' => 'Twitter', 'url' => '#', 'icon' => 'twitter', 'order' => 3],
                ]),
            ]
        );
    }

    /**
     * Create pages for a tenant.
     */
    protected function createPages(int $tenantId): void
    {
        // Home page
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'home'],
            [
                'tenant_id' => $tenantId,
                'title' => 'Home',
                'slug' => 'home',
                'content' => json_encode([
                    'hero' => [
                        'pre_title' => 'Welcome',
                        'title' => 'Your Health Journey Starts Here',
                        'description' => 'Discover exceptional care tailored to your needs.',
                        'button_text' => 'Get Started',
                        'button_link' => '/contact',
                    ],
                ]),
                'is_published' => true,
            ]
        );

        // About page
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'about'],
            [
                'tenant_id' => $tenantId,
                'title' => 'About Us',
                'slug' => 'about',
                'content' => json_encode([
                    'hero' => [
                        'pre_title' => 'Our Story',
                        'title' => 'About Us',
                        'description' => 'Learn more about our mission and values.',
                    ],
                ]),
                'is_published' => true,
            ]
        );

        // Contact page
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'contact'],
            [
                'tenant_id' => $tenantId,
                'title' => 'Contact',
                'slug' => 'contact',
                'content' => json_encode([
                    'hero' => [
                        'pre_title' => 'Get In Touch',
                        'title' => 'Contact Us',
                        'description' => 'We\'d love to hear from you.',
                    ],
                    'form' => [
                        'title' => 'Send us a message',
                        'submit_text' => 'Send Message',
                    ],
                ]),
                'is_published' => true,
            ]
        );

        // Services page
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'services'],
            [
                'tenant_id' => $tenantId,
                'title' => 'Services',
                'slug' => 'services',
                'content' => json_encode([
                    'hero' => [
                        'pre_title' => 'What We Offer',
                        'title' => 'Our Services',
                        'description' => 'Explore our comprehensive range of services.',
                    ],
                ]),
                'is_published' => true,
            ]
        );

        // Privacy Policy
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'privacy-policy'],
            [
                'tenant_id' => $tenantId,
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'content' => json_encode([
                    'hero' => [
                        'title' => 'Privacy Policy',
                        'description' => 'How we protect your data.',
                    ],
                ]),
                'is_published' => true,
            ]
        );

        // Terms of Service
        Page::updateOrCreate(
            ['tenant_id' => $tenantId, 'slug' => 'terms-of-service'],
            [
                'tenant_id' => $tenantId,
                'title' => 'Terms of Service',
                'slug' => 'terms-of-service',
                'content' => json_encode([
                    'hero' => [
                        'title' => 'Terms of Service',
                        'description' => 'Terms and conditions for using our services.',
                    ],
                ]),
                'is_published' => true,
            ]
        );
    }
}
