<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Base URL for CMS storage images.
     * This will be prepended to all image paths.
     */
    protected string $storageBaseUrl = '/storage/media';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $pages = [
            $this->getHomePage($tenantId),
            $this->getAboutPage($tenantId),
            $this->getServicesPage($tenantId),
            $this->getContactPage($tenantId),
            $this->getPrivacyPolicyPage($tenantId),
            $this->getTermsOfServicePage($tenantId),
            $this->getPartnerLoginPage($tenantId),
            $this->getPartnerSignupPage($tenantId),
        ];

        foreach ($pages as $pageData) {
            Page::updateOrCreate(
                [
                    'tenant_id' => $pageData['tenant_id'],
                    'slug' => $pageData['slug'],
                ],
                $pageData
            );
        }

        $this->command->info('Pages seeded successfully.');
    }

    /**
     * Get the Home page data.
     */
    protected function getHomePage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Home',
            'slug' => 'home',
            'meta_title' => 'Hyve Wellness - Your Premiere Virtual Health Provider',
            'meta_description' => 'Experience personalized peptide therapy from the comfort of your home. Weight loss, anti-aging, hormone optimization and more.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'YOUR PREMIERE VIRTUAL HEALTH PROVIDER',
                    'title' => 'You deserve the very best.',
                    'cta_text' => 'EXPLORE SERVICES',
                    'cta_link' => '#services',
                    'badge_text' => 'HYVE RX VIRTUAL HEALTH',
                    'featured_products' => [
                        [
                            'name' => 'Semaglutide + B12',
                            'slug' => 'semaglutide-b12',
                            'description' => '5.4 lbs. average loss per month',
                            'image' => '/images/5.png',
                        ],
                        [
                            'name' => 'NAD+',
                            'slug' => 'nad-plus',
                            'description' => 'Boost cellular energy and longevity',
                            'image' => '/images/9.png',
                        ],
                        [
                            'name' => 'PT-141',
                            'slug' => 'pt-141',
                            'description' => 'Enhanced intimacy and wellness',
                            'image' => '/images/10.png',
                        ],
                        [
                            'name' => 'Tirzepatide + B12',
                            'slug' => 'tirzepatide-b12',
                            'description' => '11.4 lbs. average loss per month',
                            'image' => '/images/16.png',
                        ],
                        [
                            'name' => 'GHK-Cu Peptide',
                            'slug' => 'ghk-cu-epithalon',
                            'description' => 'Advanced skin rejuvenation',
                            'image' => '/images/7.png',
                        ],
                        [
                            'name' => 'Sermorelin',
                            'slug' => 'sermorelin',
                            'description' => 'Natural growth hormone stimulation',
                            'image' => '/images/3.png',
                        ],
                        [
                            'name' => 'AOD 9604',
                            'slug' => 'aod-9604',
                            'description' => 'Targeted fat reduction peptide',
                            'image' => '/images/2.png',
                        ],
                    ],
                ],
                'services' => [
                    'title' => 'Our Services',
                    'pre_title' => 'WHAT WE OFFER',
                    'description' => 'Discover our comprehensive range of personalized health and wellness treatments.',
                ],
                'team' => [
                    'pre_title' => 'HERE TO SERVE YOU',
                    'title' => 'Our team',
                    'description' => 'Our expert team is dedicated to enhancing your health and wellness with personalized, cutting-edge telehealth treatments. We invite you to schedule a consultation today and start your journey towards optimal well-being.',
                    'cta_text' => 'MORE ABOUT US',
                    'cta_link' => '/about',
                    'images' => [
                        'primary' => '/images/9.png',
                        'secondary' => '/images/3-1-300x300.jpg',
                    ],
                ],
                'testimonials' => [
                    'pre_title' => 'WHAT PEOPLE ARE SAYING',
                    'title' => 'Happy Customers',
                    'description' => 'Real stories from real people who transformed their lives with our personalized health programs.',
                ],
                'faq' => [
                    'pre_title' => 'GOT QUESTIONS?',
                    'title' => 'Frequently Asked Questions',
                    'description' => 'Find answers to common questions about our telehealth services, treatments, and how to get started on your wellness journey.',
                    'cta_title' => 'Still have questions?',
                    'cta_description' => 'Our support team is here to help you 24/7.',
                    'cta_text' => 'Contact Support',
                    'cta_link' => '/contact',
                ],
                'contact' => [
                    'pre_title' => 'GET IN TOUCH',
                    'title' => 'We Would Love To Hear From You',
                    'description' => 'Have questions about our services? Ready to start your wellness journey? We\'re here to help.',
                    'phone' => '1-800-HYVE-RX',
                    'phone_hours' => 'Mon-Fri 8am to 8pm EST',
                    'email' => 'support@hyverx.com',
                    'email_response' => 'We\'ll respond within 24 hours',
                    'hours' => '24/7 Support',
                    'hours_description' => 'Always here when you need us',
                    'image' => '/images/hyve-20wellness-20mockups.png',
                    'image_title' => 'Start Your Journey Today',
                    'image_subtitle' => 'Personalized care, delivered to your door',
                ],
            ]),
            'is_published' => true,
            'order' => 1,
        ];
    }

    /**
     * Get the About page data.
     */
    protected function getAboutPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'About Us',
            'slug' => 'about',
            'meta_title' => 'About Hyve Wellness - Our Mission & Team',
            'meta_description' => 'Learn about our mission to democratize access to cutting-edge peptide therapies. Meet our team of medical experts.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'HERE TO SERVE',
                    'title' => 'About Us',
                    'description' => 'Pioneering the future of personalized telehealth with compassion, innovation, and unwavering commitment to your wellness.',
                    'image' => '/images/8-1-1030x1030.jpg',
                ],
                'stats' => [
                    ['icon' => 'Users', 'value' => '50+', 'label' => 'Licensed Providers'],
                    ['icon' => 'Heart', 'value' => '15K+', 'label' => 'Happy Patients'],
                    ['icon' => 'Star', 'value' => '4.9', 'label' => 'Average Rating'],
                    ['icon' => 'Shield', 'value' => 'HIPAA', 'label' => 'Compliant'],
                ],
                'mission' => [
                    'title' => 'Transforming Healthcare, One Patient at a Time',
                    'description' => 'We launched Hyve Wellness with a simple ambition: Provide the highest quality virtual health services while maintaining exceptional individualized patient care. Our founders believe everyone deserves to look and feel their best.',
                    'description_2' => 'We are committed to offering the best telehealth treatments, expert guidance, and personalized care to our patients nationwide.',
                    'points' => ['Personalized Care', 'Licensed Providers', 'Fast Delivery', '24/7 Support'],
                    'image' => '/images/2024-2007-20pam-20bree-20christina-20lifestyle-2010.jpg',
                ],
                'values' => [
                    [
                        'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
                        'title' => 'Patient-Centered',
                        'description' => 'Your health goals guide everything we do'
                    ],
                    [
                        'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
                        'title' => 'Innovation',
                        'description' => 'Cutting-edge telehealth technology'
                    ],
                    [
                        'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
                        'title' => 'Trust',
                        'description' => 'Licensed providers you can rely on'
                    ],
                    [
                        'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
                        'title' => 'Excellence',
                        'description' => 'Premium quality in every interaction'
                    ],
                ],
                'team' => [
                    'pre_title' => 'MEET OUR TEAM',
                    'title' => 'The People Behind Hyve',
                    'description' => 'Our team of dedicated healthcare professionals and industry experts are committed to your wellness journey.',
                ],
                'process' => [
                    'title' => 'What to Expect',
                    'description' => 'When you connect with us, you\'ll experience seamless virtual consultations with our expert team. Our telehealth platform makes premium care accessible from anywhere.',
                    'steps' => [
                        [
                            'step' => '01',
                            'title' => 'Intake',
                            'description' => [
                                'A short intake process',
                                'to assess your needs',
                                'and see if you\'re a good fit.',
                            ],
                            'image' => '/images/1-1-768x576.jpg',
                        ],
                        [
                            'step' => '02',
                            'title' => 'Review',
                            'description' => [
                                'Our medical team reviews',
                                'your intake form or, in some cases,',
                                'has a short consultation video call.',
                            ],
                            'image' => '/images/8-1-1030x1030.jpg',
                        ],
                        [
                            'step' => '03',
                            'title' => 'Ship',
                            'description' => [
                                'We send your medication',
                                'with 2-day shipping',
                                'straight to your doorstep.',
                            ],
                            'image' => '/images/3-1.jpg',
                        ],
                    ],
                ],
                'cta' => [
                    'title' => 'Ready to Start Your Transformation?',
                    'description' => 'Join thousands of satisfied patients who have transformed their lives with Hyve Wellness.',
                    'button_text' => 'GET STARTED TODAY',
                    'button_link' => '/services',
                ],
            ]),
            'is_published' => true,
            'order' => 2,
        ];
    }

    /**
     * Get the Services page data.
     */
    protected function getServicesPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Services',
            'slug' => 'services',
            'meta_title' => 'Our Services - Peptide Therapy Treatments',
            'meta_description' => 'Explore our range of peptide therapy services including weight loss, anti-aging, hormone optimization, and cognitive enhancement.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'OUR SERVICES',
                    'title' => 'A renewing experience',
                    'title_highlight' => 'awaits you.',
                    'description' => 'Explore our comprehensive range of FDA-approved peptide therapies and wellness treatments, all delivered through our convenient telehealth platform.',
                ],
                'features' => [
                    ['icon' => 'Star', 'label' => 'Premium Quality'],
                    ['icon' => 'Shield', 'label' => 'FDA Compliant'],
                    ['icon' => 'Truck', 'label' => 'Free Shipping'],
                ],
                'categories' => [
                    ['name' => 'All', 'slug' => 'all'],
                    ['name' => 'Weight Loss', 'slug' => 'weight-loss'],
                    ['name' => 'Sexual Health', 'slug' => 'sexual-health'],
                    ['name' => 'Longevity', 'slug' => 'longevity'],
                    ['name' => 'Hair', 'slug' => 'hair'],
                    ['name' => 'Skin', 'slug' => 'skin'],
                    ['name' => 'Brain & Mood', 'slug' => 'brain-and-mood'],
                    ['name' => 'Hormones', 'slug' => 'hormones'],
                ],
                'cta' => [
                    'pre_title' => 'Have Questions?',
                    'title' => "We're here to help",
                    'button_text' => 'CONTACT US',
                    'button_link' => '/contact',
                ],
            ]),
            'is_published' => true,
            'order' => 3,
        ];
    }

    /**
     * Get the Contact page data.
     */
    protected function getContactPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Contact Us',
            'slug' => 'contact',
            'meta_title' => 'Contact Hyve Wellness - Get in Touch',
            'meta_description' => 'Have questions about our peptide therapy services? Contact our team for a free consultation.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'GET IN TOUCH',
                    'title' => 'Contact Us',
                    'description' => 'Have questions about our services? We\'re here to help. Fill out the form below and our team will get back to you shortly.',
                ],
                'form' => [
                    'title' => 'Send Us a Message',
                    'success_message' => 'Thank you for contacting us! We\'ll get back to you within 24 hours.',
                    'submit_text' => 'Send Message',
                ],
                'contact_info' => [
                    'phone' => [
                        'value' => '1-800-HYVE-RX',
                        'description' => 'Mon-Fri, 8am to 8pm EST',
                    ],
                    'email' => [
                        'value' => 'support@hyverx.com',
                        'description' => 'We\'ll respond within 24 hours',
                    ],
                    'hours' => [
                        'value' => '24/7 Support',
                        'description' => 'Always here when you need us',
                    ],
                ],
                'cta' => [
                    'title' => 'Prefer to speak with someone now?',
                    'description' => 'Our patient care team is available to answer your questions and help you get started.',
                    'button_text' => 'Schedule a Call',
                    'button_link' => '#',
                ],
            ]),
            'is_published' => true,
            'order' => 4,
        ];
    }

    /**
     * Get the Privacy Policy page data.
     */
    protected function getPrivacyPolicyPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'meta_title' => 'Privacy Policy - Hyve Wellness',
            'meta_description' => 'Read our privacy policy to understand how we protect your personal health information.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'YOUR PRIVACY MATTERS',
                    'title' => 'Privacy Policy',
                    'title_highlight' => 'Policy',
                    'description' => 'We are committed to protecting your personal information and being transparent about how we use it.',
                    'effective_date' => 'January 1, 2025',
                ],
                'sections' => [
                    [
                        'id' => 'introduction',
                        'title' => 'Introduction',
                        'icon' => 'FileText',
                        'content' => 'Hyve Wellness LLC ("Company," "Hyve Wellness," "we," "us," or "our") has developed this Privacy Policy for users ("user" or "you") who use or access our website, as well as any related media forms, media channels, mobile websites, or mobile applications.\n\nThis Privacy Policy is designed to inform you about the types of information that Hyve Wellness may gather or collect from you in connection with your use of the Website. It also explains the circumstances under which Hyve Wellness uses and discloses that information.\n\nBy using or accessing the Website, you are accepting and agreeing to the practices described in this Privacy Policy.',
                        'notice' => [
                            'title' => 'Important Notice',
                            'text' => 'By using or accessing the Website, you are accepting and agreeing to the practices described in this Privacy Policy.',
                        ],
                    ],
                    [
                        'id' => 'information-collection',
                        'title' => 'Information Collection',
                        'icon' => 'Eye',
                        'content' => 'Like most website operators, Hyve Wellness collects Non-Personally Identifying Information that web browsers typically make available.\n\nWe may collect personal information such as your name, email address, phone number, and other details you provide when using our services, creating an account, or contacting us.',
                        'non_pii_items' => [
                            'Internet Protocol (IP) address',
                            'Browser type and version',
                            'Operating system',
                            'Device type',
                            'Language preferences',
                            'Referring website addresses',
                        ],
                        'pii_title' => 'Personally Identifying Information',
                        'pii_content' => 'We may collect personal information such as your name, email address, phone number, and other details you provide when using our services, creating an account, or contacting us.',
                    ],
                    [
                        'id' => 'cookies',
                        'title' => 'Web Cookies',
                        'icon' => 'Lock',
                        'content' => 'A "Web Cookie" is a small text file containing a string of characters that a website stores on a user\'s device. We use cookies to enhance your experience on our Website.',
                        'cookie_uses' => [
                            'Keep track of services you have used',
                            'Record registration information related to your login',
                            'Remember your preferences and settings',
                            'Keep you logged in as you navigate',
                            'Facilitate purchase and checkout procedures',
                            'Analyze how users interact with the Website',
                        ],
                        'cookie_notice' => 'Users who do not wish to have cookies placed on their devices should set their browsers to refuse cookies before accessing the Website, with the understanding that certain features may not function properly.',
                    ],
                    [
                        'id' => 'data-protection',
                        'title' => 'Data Protection',
                        'icon' => 'Shield',
                        'content' => 'We take the security of your personal information seriously. Hyve Wellness implements industry-standard security measures to protect your data.\n\nThe Website is hosted and operated in the United States of America and is subject to U.S. federal law and the laws of the State of Texas.',
                        'security_features' => [
                            [
                                'icon' => 'Lock',
                                'title' => 'Encryption',
                                'description' => 'All data transmitted to and from our servers is encrypted using SSL/TLS protocols.',
                            ],
                            [
                                'icon' => 'Shield',
                                'title' => 'HIPAA Compliant',
                                'description' => 'Our systems are fully compliant with HIPAA regulations for healthcare data protection.',
                            ],
                        ],
                    ],
                    [
                        'id' => 'contact',
                        'title' => 'Contact Us',
                        'icon' => 'Mail',
                        'content' => 'If you have any questions about this Privacy Policy, our privacy practices, or your rights, please contact us:',
                        'contact_methods' => [
                            [
                                'icon' => 'Mail',
                                'title' => 'By Email',
                                'value' => 'support@hyvewellness.com',
                                'link' => 'mailto:support@hyvewellness.com',
                            ],
                            [
                                'icon' => 'MapPin',
                                'title' => 'By Mail',
                                'value' => 'Hyve Wellness LLC\nAttn: Privacy Officer\n1 Cowboys Way\nFrisco, TX 75034',
                            ],
                        ],
                    ],
                ],
                'footer_note' => 'This Privacy Policy is effective as of January 1, 2025. Any changes will be posted on the Website with an updated effective date.',
            ]),
            'is_published' => true,
            'order' => 5,
        ];
    }

    /**
     * Get the Terms of Service page data.
     */
    protected function getTermsOfServicePage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Terms of Service',
            'slug' => 'terms-of-service',
            'meta_title' => 'Terms of Service - Hyve Wellness',
            'meta_description' => 'Read our terms of service for using Hyve Wellness telehealth platform.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'LEGAL',
                    'title' => 'Terms of Service',
                    'description' => 'Please read these terms carefully before using our services.',
                    'effective_date' => 'January 1, 2025',
                ],
                'sections' => [
                    [
                        'id' => 'acceptance',
                        'title' => 'Acceptance of Terms',
                        'icon' => 'FileText',
                        'content' => 'By accessing or using the Hyve Wellness platform and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.',
                    ],
                    [
                        'id' => 'services',
                        'title' => 'Our Services',
                        'icon' => 'Star',
                        'content' => 'Hyve Wellness provides telehealth consultations, peptide therapy treatments, and related wellness services. All medical services are provided by licensed healthcare providers.',
                    ],
                    [
                        'id' => 'eligibility',
                        'title' => 'Eligibility',
                        'icon' => 'Users',
                        'content' => 'You must be at least 18 years old and a resident of a state where we offer services to use our platform. You must provide accurate health information for proper treatment.',
                    ],
                    [
                        'id' => 'payments',
                        'title' => 'Payments & Refunds',
                        'icon' => 'CreditCard',
                        'content' => 'Payment is required at the time of service. Refunds may be available for unused services as outlined in our refund policy. Subscription services can be cancelled at any time.',
                    ],
                    [
                        'id' => 'liability',
                        'title' => 'Limitation of Liability',
                        'icon' => 'Shield',
                        'content' => 'Hyve Wellness and its providers are not liable for any indirect, incidental, or consequential damages arising from your use of our services.',
                    ],
                ],
            ]),
            'is_published' => true,
            'order' => 6,
        ];
    }

    /**
     * Get the Partner Login page data.
     */
    protected function getPartnerLoginPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Partner Login',
            'slug' => 'partner-login',
            'meta_title' => 'Partner Portal Login - Hyve Wellness',
            'meta_description' => 'Sign in to your Hyve Wellness partner portal to manage your account, track earnings, and access resources.',
            'content' => json_encode([
                'hero' => [
                    'icon_title' => 'Partner Portal',
                    'title' => 'Partner Portal',
                    'description' => 'Welcome back! Sign in to your account.',
                ],
                'form' => [
                    'email_label' => 'Email Address',
                    'email_placeholder' => 'partner@example.com',
                    'password_label' => 'Password',
                    'password_placeholder' => '••••••••',
                    'remember_me' => 'Remember me',
                    'forgot_password_text' => 'Forgot password?',
                    'forgot_password_link' => '#',
                    'submit_text' => 'SIGN IN',
                    'submitting_text' => 'SIGNING IN...',
                ],
                'signup_cta' => [
                    'divider_text' => 'New to Hyve Wellness?',
                    'description' => 'Join our network of healthcare professionals',
                    'button_text' => 'BECOME A PARTNER',
                    'button_link' => '/partners/signup',
                ],
                'footer' => [
                    'help_text' => 'Need help?',
                    'help_link_text' => 'Contact support',
                    'help_link' => '/contact',
                    'security_text' => 'Secured with 256-bit SSL encryption',
                ],
                'settings' => [
                    'logo' => '/images/hyve-20logo-20-20350-20x-20100-20-20charcoal.png',
                    'redirect_url' => 'https://partner.hyverx.com/',
                ],
            ]),
            'is_published' => true,
            'order' => 7,
        ];
    }

    /**
     * Get the Partner Signup page data.
     */
    protected function getPartnerSignupPage(int $tenantId): array
    {
        return [
            'tenant_id' => $tenantId,
            'title' => 'Partner Signup',
            'slug' => 'partner-signup',
            'meta_title' => 'Become a Partner - Hyve Wellness',
            'meta_description' => 'Join our wellness partnership program. Help your community access quality healthcare while earning meaningful income.',
            'content' => json_encode([
                'hero' => [
                    'pre_title' => 'WELLNESS PARTNERSHIP PROGRAM',
                    'title' => 'Share Wellness.',
                    'title_highlight' => 'Build Your Business.',
                    'description' => 'Are you passionate about health and wellness? Join our community of wellness advocates, fitness professionals, influencers, and community leaders who are helping people access quality telehealth services while earning meaningful income.',
                    'image' => '/images/hyve-20logo-20-20350-20x-20100-20-20champagne-20gold.png',
                ],
                'partner_types' => [
                    'title' => 'Who We\'re Looking For',
                    'description' => 'Our partnership program is designed for people who genuinely care about helping others live healthier lives.',
                    'items' => [
                        [
                            'icon' => 'Users',
                            'title' => 'Community Leaders',
                            'description' => 'Coaches, mentors, and organizers with trusted networks',
                            'gradient' => 'from-[#c9a962] to-[#d4c4a8]',
                        ],
                        [
                            'icon' => 'Heart',
                            'title' => 'Wellness Professionals',
                            'description' => 'Personal trainers, nutritionists, yoga instructors, and health coaches',
                            'gradient' => 'from-[#9a8b7a] to-[#c9a962]',
                        ],
                        [
                            'icon' => 'TrendingUp',
                            'title' => 'Content Creators',
                            'description' => 'Health influencers and educators with engaged audiences',
                            'gradient' => 'from-[#d4c4a8] to-[#9a8b7a]',
                        ],
                    ],
                ],
                'benefits' => [
                    'title' => 'What You\'ll Get',
                    'items' => [
                        [
                            'icon' => 'DollarSign',
                            'title' => 'Competitive Commission Structure',
                            'description' => 'Earn recurring income on every wellness membership you bring to Hyve Wellness. Build a sustainable book of business with our generous commission model designed for long-term success.',
                        ],
                        [
                            'icon' => 'GraduationCap',
                            'title' => 'Comprehensive Training',
                            'description' => 'Access our health education library, sales training programs, and product knowledge courses. We\'ll equip you with everything you need to confidently share our services.',
                        ],
                        [
                            'icon' => 'Headphones',
                            'title' => 'Full Support System',
                            'description' => 'Our dedicated partner success team provides medical expertise, marketing materials, and ongoing support. You\'re never alone in helping your clients achieve their wellness goals.',
                        ],
                        [
                            'icon' => 'CheckCircle2',
                            'title' => 'Low-Cost Pricing Model',
                            'description' => 'Offer your community access to premium telehealth services at accessible price points. Our membership model makes quality care achievable for everyone you serve.',
                        ],
                    ],
                ],
                'how_it_works' => [
                    'title' => 'How It Works',
                    'steps' => [
                        [
                            'number' => '1',
                            'title' => 'Apply to Join',
                            'description' => 'Tell us about yourself and your passion for wellness. We\'ll review your application and schedule a call to learn more about your goals.',
                        ],
                        [
                            'number' => '2',
                            'title' => 'Get Trained & Certified',
                            'description' => 'Complete our partner onboarding program. Learn about our treatments, membership options, and how to best serve your community\'s health needs.',
                        ],
                        [
                            'number' => '3',
                            'title' => 'Share With Your Community',
                            'description' => 'Use your unique partner link and resources to introduce wellness memberships to your audience. Help people access telehealth services that can transform their lives.',
                        ],
                        [
                            'number' => '4',
                            'title' => 'Earn & Grow',
                            'description' => 'Receive commissions on every membership. As your client base grows, so does your recurring income. Join our community of partners making a real difference.',
                        ],
                    ],
                ],
                'community' => [
                    'title' => 'Join Our Partner Community',
                    'description' => 'When you become a Hyve Wellness partner, you\'re not just earning income - you\'re joining a supportive community of like-minded wellness advocates. Share strategies, celebrate wins, and grow together with people who share your passion for helping others live their healthiest lives.',
                    'stats' => [
                        ['icon' => 'Shield', 'text' => 'Trusted by 500+ partners'],
                        ['icon' => 'Users', 'text' => 'Active community support'],
                    ],
                ],
                'cta' => [
                    'title' => 'Ready to Make an Impact?',
                    'description' => 'Turn your passion for wellness into a rewarding opportunity. Help your community access quality healthcare while building a business you can be proud of.',
                    'button_text' => 'APPLY NOW',
                    'button_link' => '#',
                    'login_text' => 'Already a partner?',
                    'login_link_text' => 'Sign in to your portal',
                    'login_link' => '/partners/login',
                ],
                'settings' => [
                    'logo' => '/images/hyve-20logo-20-20350-20x-20100-20-20champagne-20gold.png',
                ],
            ]),
            'is_published' => true,
            'order' => 8,
        ];
    }
}
