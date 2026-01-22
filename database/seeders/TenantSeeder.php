<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Section;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Template;
use App\Models\Tenant;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default template
        $template = Template::updateOrCreate(
            ['slug' => 'hyve-wellness'],
            [
                'name' => 'Hyve Wellness',
                'description' => 'Modern wellness and medical services template',
                'preview_image' => '/templates/hyve-wellness/preview.png',
                'version' => '1.0.0',
                'supported_components' => [
                    'hero',
                    'services_grid',
                    'testimonials',
                    'faq',
                    'team',
                    'contact',
                    'cta',
                ],
                'is_active' => true,
            ]
        );

        // Create demo tenant
        $tenant = Tenant::updateOrCreate(
            ['slug' => 'hyve-wellness'],
            [
                'name' => 'Hyve Wellness',
                'domain' => 'wellness.hyve.com',
                'active_template_id' => $template->id,
                'settings' => [
                    'company_name' => 'Hyve Wellness',
                    'tagline' => 'Premium Wellness Solutions',
                ],
                'is_active' => true,
            ]
        );

        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@hyve.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'tenant_id' => $tenant->id,
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );

        // Create service categories
        $categories = [
            ['name' => 'Peptide Therapies', 'slug' => 'peptide-therapies', 'order' => 0],
            ['name' => 'Hormone Optimization', 'slug' => 'hormone-optimization', 'order' => 1],
            ['name' => 'IV Therapies', 'slug' => 'iv-therapies', 'order' => 2],
            ['name' => 'Weight Management', 'slug' => 'weight-management', 'order' => 3],
        ];

        foreach ($categories as $catData) {
            ServiceCategory::updateOrCreate(
                ['tenant_id' => $tenant->id, 'slug' => $catData['slug']],
                $catData + ['tenant_id' => $tenant->id]
            );
        }

        // Create sample services
        $peptideCategory = ServiceCategory::where('slug', 'peptide-therapies')->first();
        
        $services = [
            [
                'tenant_id' => $tenant->id,
                'category_id' => $peptideCategory->id,
                'name' => 'BPC-157',
                'slug' => 'bpc-157',
                'description' => 'A powerful peptide for tissue repair and healing',
                'headline' => 'Advanced Tissue Repair',
                'pricing' => 'Starting at $299',
                'is_popular' => true,
                'is_published' => true,
                'order' => 0,
            ],
            [
                'tenant_id' => $tenant->id,
                'category_id' => $peptideCategory->id,
                'name' => 'CJC-1295 + Ipamorelin',
                'slug' => 'cjc-1295-ipamorelin',
                'description' => 'Growth hormone releasing peptide combination',
                'headline' => 'Optimize Your Growth Hormone',
                'pricing' => 'Starting at $349',
                'is_popular' => true,
                'is_published' => true,
                'order' => 1,
            ],
        ];

        foreach ($services as $serviceData) {
            Service::updateOrCreate(
                ['tenant_id' => $serviceData['tenant_id'], 'slug' => $serviceData['slug']],
                $serviceData
            );
        }

        // Create FAQs
        $faqs = [
            [
                'tenant_id' => $tenant->id,
                'question' => 'What are peptide therapies?',
                'answer' => 'Peptide therapies use short chains of amino acids to signal your body to perform specific functions, such as healing, weight loss, or hormone optimization.',
                'category' => 'General',
                'order' => 0,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenant->id,
                'question' => 'Are these treatments safe?',
                'answer' => 'All our treatments are administered by licensed medical professionals and have been extensively studied for safety and efficacy.',
                'category' => 'Safety',
                'order' => 1,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenant->id,
                'question' => 'How do I get started?',
                'answer' => 'Simply book a consultation with one of our providers. We\'ll review your health history and goals to create a personalized treatment plan.',
                'category' => 'Getting Started',
                'order' => 2,
                'is_published' => true,
            ],
        ];

        foreach ($faqs as $faqData) {
            Faq::updateOrCreate(
                ['tenant_id' => $faqData['tenant_id'], 'question' => $faqData['question']],
                $faqData
            );
        }

        // Create sample testimonials
        $testimonials = [
            [
                'tenant_id' => $tenant->id,
                'author_name' => 'John D.',
                'author_title' => 'Business Executive',
                'content' => 'The peptide therapy has completely transformed my recovery from workouts. I feel 10 years younger!',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
                'order' => 0,
            ],
            [
                'tenant_id' => $tenant->id,
                'author_name' => 'Sarah M.',
                'author_title' => 'Fitness Enthusiast',
                'content' => 'Amazing results with the weight management program. The team is incredibly supportive and knowledgeable.',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
                'order' => 1,
            ],
        ];

        foreach ($testimonials as $testimonialData) {
            Testimonial::updateOrCreate(
                ['tenant_id' => $testimonialData['tenant_id'], 'author_name' => $testimonialData['author_name']],
                $testimonialData
            );
        }

        // Create team members
        $teamMembers = [
            [
                'tenant_id' => $tenant->id,
                'name' => 'Dr. Jane Smith',
                'title' => 'Medical Director',
                'bio' => 'Board-certified physician with over 15 years of experience in regenerative medicine.',
                'is_published' => true,
                'order' => 0,
            ],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Dr. Michael Chen',
                'title' => 'Wellness Specialist',
                'bio' => 'Expert in peptide therapies and hormone optimization with a focus on personalized care.',
                'is_published' => true,
                'order' => 1,
            ],
        ];

        foreach ($teamMembers as $memberData) {
            TeamMember::updateOrCreate(
                ['tenant_id' => $memberData['tenant_id'], 'name' => $memberData['name']],
                $memberData
            );
        }

        // Create header menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenant->id, 'location' => 'header'],
            [
                'name' => 'Main Navigation',
                'items' => [
                    ['label' => 'Home', 'url' => '/', 'order' => 0],
                    ['label' => 'Services', 'url' => '/services', 'order' => 1],
                    ['label' => 'About', 'url' => '/about', 'order' => 2],
                    ['label' => 'Contact', 'url' => '/contact', 'order' => 3],
                ],
                'is_active' => true,
            ]
        );

        // Create footer menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenant->id, 'location' => 'footer'],
            [
                'name' => 'Footer Navigation',
                'items' => [
                    ['label' => 'Privacy Policy', 'url' => '/privacy-policy', 'order' => 0],
                    ['label' => 'Terms of Service', 'url' => '/terms', 'order' => 1],
                ],
                'is_active' => true,
            ]
        );

        // Create default settings - handled by SettingSeeder now
        // Skip if SettingSeeder is called separately

        // Create home page with sections
        $homePage = Page::updateOrCreate(
            ['tenant_id' => $tenant->id, 'slug' => 'home'],
            [
                'title' => 'Home',
                'meta_title' => 'Hyve Wellness - Premium Wellness Solutions',
                'meta_description' => 'Discover premium wellness solutions with our cutting-edge peptide therapies, hormone optimization, and more.',
                'is_published' => true,
            ]
        );

        // Home page sections - Using updateOrCreate to avoid duplicates
        $sections = [
            [
                'page_id' => $homePage->id,
                'component_type' => 'hero',
                'content' => [
                    'title' => 'Elevate Your Wellness',
                    'subtitle' => 'Premium peptide therapies and wellness solutions tailored to your needs',
                    'cta_text' => 'Explore Services',
                    'cta_link' => '/services',
                ],
                'order' => 0,
            ],
            [
                'page_id' => $homePage->id,
                'component_type' => 'services_grid',
                'content' => [
                    'title' => 'Our Services',
                    'subtitle' => 'Discover our range of wellness solutions',
                    'show_popular' => true,
                ],
                'order' => 1,
            ],
            [
                'page_id' => $homePage->id,
                'component_type' => 'testimonials',
                'content' => [
                    'title' => 'What Our Clients Say',
                ],
                'order' => 2,
            ],
            [
                'page_id' => $homePage->id,
                'component_type' => 'faq',
                'content' => [
                    'title' => 'Frequently Asked Questions',
                ],
                'order' => 3,
            ],
        ];

        foreach ($sections as $sectionData) {
            Section::updateOrCreate(
                ['page_id' => $sectionData['page_id'], 'component_type' => $sectionData['component_type']],
                $sectionData
            );
        }

        $this->command->info('Demo tenant created successfully!');
        $this->command->info('Login: admin@hyve.com / password');
    }
}
