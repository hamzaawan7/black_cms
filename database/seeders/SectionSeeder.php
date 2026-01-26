<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Section;
use Illuminate\Database\Seeder;

/**
 * SectionSeeder - Creates all sections for pages with proper content and styles.
 * 
 * This seeder ensures that each page has all its sections properly configured
 * with editable content, images, and styling options that mirror the frontend.
 */
class SectionSeeder extends Seeder
{
    /**
     * Base URL for CMS storage images.
     */
    protected string $storageBaseUrl = '/storage/media';

    /**
     * Default styles structure for sections.
     */
    protected function getDefaultStyles(): array
    {
        return [
            'background_color' => null,
            'text_color' => null,
            'heading_color' => null,
            'font_size' => 'base', // xs, sm, base, lg, xl, 2xl
            'padding_top' => 'lg', // none, sm, md, lg, xl
            'padding_bottom' => 'lg',
            'container_width' => 'default', // default, narrow, wide, full
            'custom_css_class' => '',
        ];
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing sections
        Section::truncate();

        // Seed sections for each page
        $this->seedHomeSections();
        $this->seedAboutSections();
        $this->seedContactSections();
        $this->seedServicesPageSections();

        $this->command->info('Sections seeded successfully.');
    }

    /**
     * Seed all sections for the Home page.
     * 
     * The Home page has 6 sections that match the frontend:
     * 1. Hero - Main banner with carousel
     * 2. Services Grid - Service categories
     * 3. Team - About the team
     * 4. Testimonials - Customer reviews
     * 5. FAQ - Frequently asked questions
     * 6. Contact - Contact form and info
     */
    protected function seedHomeSections(): void
    {
        $page = Page::where('slug', 'home')->first();
        if (!$page) {
            $this->command->warn('Home page not found. Skipping home sections.');
            return;
        }

        $sections = [
            $this->getHeroSection(),
            $this->getServicesGridSection(),
            $this->getTeamSection(),
            $this->getTestimonialsSection(),
            $this->getFaqSection(),
            $this->getContactSection(),
        ];

        foreach ($sections as $index => $sectionData) {
            Section::create([
                'tenant_id' => $page->tenant_id,
                'page_id' => $page->id,
                'component_type' => $sectionData['component_type'],
                'order' => $index + 1,
                'is_visible' => true,
                'content' => $sectionData['content'],
                'styles' => array_merge($this->getDefaultStyles(), $sectionData['styles'] ?? []),
                'settings' => $sectionData['settings'] ?? [],
            ]);
        }

        $this->command->info("Created {$page->title} page sections: " . count($sections));
    }

    /**
     * Hero Section - Main banner with product carousel
     */
    protected function getHeroSection(): array
    {
        return [
            'component_type' => 'hero',
            'content' => [
                'pre_title' => 'YOUR PREMIERE VIRTUAL HEALTH PROVIDER',
                'title' => 'You deserve the very best.',
                'subtitle' => '',
                'cta_text' => 'EXPLORE SERVICES',
                'cta_link' => '#services',
                'secondary_cta_text' => '',
                'secondary_cta_link' => '',
                'badge_text' => 'HYVE RX VIRTUAL HEALTH',
                'featured_products' => [
                    [
                        'name' => 'Semaglutide + B12',
                        'slug' => 'semaglutide-b12',
                        'description' => '5.4 lbs. average loss per month',
                        'image' => $this->storageBaseUrl . '/products/5.png',
                    ],
                    [
                        'name' => 'NAD+',
                        'slug' => 'nad-plus',
                        'description' => 'Boost cellular energy and longevity',
                        'image' => $this->storageBaseUrl . '/products/9.png',
                    ],
                    [
                        'name' => 'PT-141',
                        'slug' => 'pt-141',
                        'description' => 'Enhanced intimacy and wellness',
                        'image' => $this->storageBaseUrl . '/products/10.png',
                    ],
                    [
                        'name' => 'Tirzepatide + B12',
                        'slug' => 'tirzepatide-b12',
                        'description' => '11.4 lbs. average loss per month',
                        'image' => $this->storageBaseUrl . '/products/16.png',
                    ],
                    [
                        'name' => 'GHK-Cu Peptide',
                        'slug' => 'ghk-cu-peptide',
                        'description' => 'Advanced skin rejuvenation',
                        'image' => $this->storageBaseUrl . '/products/7.png',
                    ],
                    [
                        'name' => 'Sermorelin',
                        'slug' => 'sermorelin',
                        'description' => 'Natural growth hormone stimulation',
                        'image' => $this->storageBaseUrl . '/products/3.png',
                    ],
                    [
                        'name' => 'AOD 9604',
                        'slug' => 'aod-9604',
                        'description' => 'Targeted fat reduction peptide',
                        'image' => $this->storageBaseUrl . '/products/2.png',
                    ],
                ],
            ],
            'styles' => [
                'background_color' => '#d4c4a8',
                'text_color' => '#2d2d2d',
                'heading_color' => '#1a1a1a',
            ],
            'settings' => [
                'autoplay' => true,
                'autoplay_speed' => 5000,
                'show_badge' => true,
            ],
        ];
    }

    /**
     * Services Grid Section - Display service categories
     */
    protected function getServicesGridSection(): array
    {
        return [
            'component_type' => 'services_grid',
            'content' => [
                'pre_title' => 'WHAT WE OFFER',
                'title' => 'Our Services',
                'description' => 'Discover our comprehensive range of personalized health and wellness treatments.',
                'cta_text' => 'View All Services',
                'cta_link' => '/services',
                // Note: Actual service categories are loaded dynamically from the database
            ],
            'styles' => [
                'background_color' => '#f5f2eb',
                'text_color' => '#6b6b6b',
                'heading_color' => '#3d3d3d',
            ],
            'settings' => [
                'columns' => 4,
                'show_description' => true,
                'card_style' => 'minimal',
            ],
        ];
    }

    /**
     * Team Section - About the team with images
     */
    protected function getTeamSection(): array
    {
        return [
            'component_type' => 'team',
            'content' => [
                'pre_title' => 'HERE TO SERVE YOU',
                'title' => 'Our team',
                'description' => 'Our expert team is dedicated to enhancing your health and wellness with personalized, cutting-edge telehealth treatments. We invite you to schedule a consultation today and start your journey towards optimal well-being.',
                'cta_text' => 'MORE ABOUT US',
                'cta_link' => '/about',
                'images' => [
                    'primary' => $this->storageBaseUrl . '/pages/9.png',
                    'secondary' => $this->storageBaseUrl . '/pages/3-1-300x300.jpg',
                ],
            ],
            'styles' => [
                'background_color' => '#f5f4f0',
                'text_color' => '#6b6b6b',
                'heading_color' => '#2d2d2d',
            ],
            'settings' => [
                'image_position' => 'left',
                'show_cta' => true,
            ],
        ];
    }

    /**
     * Testimonials Section - Customer reviews carousel
     */
    protected function getTestimonialsSection(): array
    {
        return [
            'component_type' => 'testimonials',
            'content' => [
                'pre_title' => 'WHAT PEOPLE ARE SAYING',
                'title' => 'Happy Customers',
                'description' => 'Real stories from real people who transformed their lives with our personalized health programs.',
                // Note: Actual testimonials are loaded from the testimonials table
            ],
            'styles' => [
                'background_color' => '#3d3d3d',
                'text_color' => '#ffffff',
                'heading_color' => '#ffffff',
            ],
            'settings' => [
                'autoplay' => true,
                'autoplay_speed' => 5000,
                'show_rating' => true,
                'show_image' => true,
            ],
        ];
    }

    /**
     * FAQ Section - Frequently asked questions
     */
    protected function getFaqSection(): array
    {
        return [
            'component_type' => 'faq',
            'content' => [
                'pre_title' => 'GOT QUESTIONS?',
                'title' => 'Frequently Asked Questions',
                'description' => 'Find answers to common questions about our telehealth services, treatments, and how to get started on your wellness journey.',
                'cta_title' => 'Still have questions?',
                'cta_description' => 'Our support team is here to help you 24/7.',
                'cta_text' => 'Contact Support',
                'cta_link' => '/contact',
                // Note: Actual FAQs are loaded from the faqs table
            ],
            'styles' => [
                'background_color' => '#f5f2eb',
                'text_color' => '#6b6b6b',
                'heading_color' => '#3d3d3d',
            ],
            'settings' => [
                'default_open' => 0, // First item open by default
                'show_cta_card' => true,
            ],
        ];
    }

    /**
     * Contact Section - Contact form and info
     */
    protected function getContactSection(): array
    {
        return [
            'component_type' => 'contact',
            'content' => [
                'pre_title' => 'GET IN TOUCH',
                'title' => 'We Would Love To Hear From You',
                'description' => 'Have questions about our services? Ready to start your wellness journey? We\'re here to help.',
                'phone' => '1-800-HYVE-RX',
                'phone_hours' => 'Mon-Fri 8am to 8pm EST',
                'email' => 'support@hyverx.com',
                'email_response' => 'We\'ll respond within 24 hours',
                'hours' => '24/7 Support',
                'hours_description' => 'Always here when you need us',
                'image' => $this->storageBaseUrl . '/pages/hyve-wellness-mockups.png',
                'image_title' => 'Start Your Journey Today',
                'image_subtitle' => 'Personalized care, delivered to your door',
            ],
            'styles' => [
                'background_color' => '#ffffff',
                'text_color' => '#6b6b6b',
                'heading_color' => '#2d2d2d',
            ],
            'settings' => [
                'show_form' => true,
                'show_map' => false,
            ],
        ];
    }

    /**
     * Seed sections for the About page.
     */
    protected function seedAboutSections(): void
    {
        $page = Page::where('slug', 'about')->first();
        if (!$page) {
            $this->command->warn('About page not found. Skipping about sections.');
            return;
        }

        $sections = [
            [
                'component_type' => 'hero_about',
                'content' => [
                    'pre_title' => 'ABOUT HYVE WELLNESS',
                    'title' => 'Transforming Lives Through Innovative Healthcare',
                    'description' => 'We\'re on a mission to make cutting-edge peptide therapy and personalized wellness treatments accessible to everyone, from the comfort of their home.',
                    'image' => $this->storageBaseUrl . '/pages/8-1-1030x1030.jpg',
                ],
                'styles' => [
                    'background_color' => '#f5f4f0',
                    'text_color' => '#6b6b6b',
                ],
            ],
            [
                'component_type' => 'stats',
                'content' => [
                    'items' => [
                        ['icon' => 'Users', 'value' => '50+', 'label' => 'Licensed Providers'],
                        ['icon' => 'Heart', 'value' => '15K+', 'label' => 'Happy Patients'],
                        ['icon' => 'Star', 'value' => '4.9', 'label' => 'Average Rating'],
                        ['icon' => 'Shield', 'value' => 'HIPAA', 'label' => 'Compliant'],
                    ],
                ],
                'styles' => [
                    'background_color' => '#ffffff',
                ],
            ],
            [
                'component_type' => 'mission',
                'content' => [
                    'title' => 'Our Mission',
                    'description' => 'At Hyve Wellness, we believe everyone deserves access to the latest advancements in health and wellness.',
                    'points' => ['Personalized Care', 'Licensed Providers', 'Fast Delivery', '24/7 Support'],
                    'image' => $this->storageBaseUrl . '/pages/2024-07-pam-bree-christina-lifestyle-10.jpg',
                ],
                'styles' => [
                    'background_color' => '#f5f2eb',
                ],
            ],
        ];

        foreach ($sections as $index => $sectionData) {
            Section::create([
                'tenant_id' => $page->tenant_id,
                'page_id' => $page->id,
                'component_type' => $sectionData['component_type'],
                'order' => $index + 1,
                'is_visible' => true,
                'content' => $sectionData['content'],
                'styles' => array_merge($this->getDefaultStyles(), $sectionData['styles'] ?? []),
                'settings' => $sectionData['settings'] ?? [],
            ]);
        }

        $this->command->info("Created {$page->title} page sections: " . count($sections));
    }

    /**
     * Seed sections for the Contact page.
     */
    protected function seedContactSections(): void
    {
        $page = Page::where('slug', 'contact')->first();
        if (!$page) {
            $this->command->warn('Contact page not found. Skipping contact sections.');
            return;
        }

        $sections = [
            [
                'component_type' => 'contact_hero',
                'content' => [
                    'pre_title' => 'CONTACT US',
                    'title' => 'Get In Touch',
                    'description' => 'We\'re here to help you on your wellness journey.',
                ],
                'styles' => [
                    'background_color' => '#f5f4f0',
                ],
            ],
            [
                'component_type' => 'contact_form',
                'content' => [
                    'title' => 'Send Us a Message',
                    'phone' => '1-800-HYVE-RX',
                    'email' => 'support@hyverx.com',
                    'address' => '123 Wellness Ave, Health City, HC 12345',
                ],
                'styles' => [
                    'background_color' => '#ffffff',
                ],
            ],
        ];

        foreach ($sections as $index => $sectionData) {
            Section::create([
                'tenant_id' => $page->tenant_id,
                'page_id' => $page->id,
                'component_type' => $sectionData['component_type'],
                'order' => $index + 1,
                'is_visible' => true,
                'content' => $sectionData['content'],
                'styles' => array_merge($this->getDefaultStyles(), $sectionData['styles'] ?? []),
                'settings' => $sectionData['settings'] ?? [],
            ]);
        }

        $this->command->info("Created {$page->title} page sections: " . count($sections));
    }

    /**
     * Seed sections for the Services page.
     */
    protected function seedServicesPageSections(): void
    {
        $page = Page::where('slug', 'services')->first();
        if (!$page) {
            $this->command->warn('Services page not found. Skipping services sections.');
            return;
        }

        $sections = [
            [
                'component_type' => 'services_hero',
                'content' => [
                    'pre_title' => 'OUR SERVICES',
                    'title' => 'Comprehensive Health Solutions',
                    'description' => 'Explore our full range of telehealth services designed to optimize your health and wellness.',
                ],
                'styles' => [
                    'background_color' => '#f5f4f0',
                ],
            ],
            [
                'component_type' => 'services_list',
                'content' => [
                    'title' => 'All Services',
                    'description' => 'Browse our complete catalog of health and wellness treatments.',
                ],
                'styles' => [
                    'background_color' => '#ffffff',
                ],
            ],
        ];

        foreach ($sections as $index => $sectionData) {
            Section::create([
                'tenant_id' => $page->tenant_id,
                'page_id' => $page->id,
                'component_type' => $sectionData['component_type'],
                'order' => $index + 1,
                'is_visible' => true,
                'content' => $sectionData['content'],
                'styles' => array_merge($this->getDefaultStyles(), $sectionData['styles'] ?? []),
                'settings' => $sectionData['settings'] ?? [],
            ]);
        }

        $this->command->info("Created {$page->title} page sections: " . count($sections));
    }
}
