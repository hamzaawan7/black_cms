<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\Section;
use Illuminate\Database\Seeder;

class PrivacyPolicySectionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the Privacy Policy page
        $page = Page::where('slug', 'privacy-policy')->first();
        
        if (!$page) {
            $this->command->error('Privacy Policy page not found!');
            return;
        }

        $this->command->info('Adding sections to Privacy Policy page...');

        // Delete existing sections if any
        Section::where('page_id', $page->id)->delete();

        // Create Privacy Policy Hero Section
        Section::create([
            'page_id' => $page->id,
            'tenant_id' => $page->tenant_id ?? 1,
            'component_type' => 'legal_hero',
            'content' => [
                'pre_title' => 'LEGAL',
                'title' => 'Privacy Policy',
                'description' => 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.',
                'last_updated' => date('F d, Y'),
            ],
            'styles' => [
                'background_color' => '#f5f2eb',
                'text_color' => '#6b6b6b',
                'heading_color' => '#3d3d3d',
                'padding_top' => 'lg',
                'padding_bottom' => 'md',
            ],
            'order' => 1,
            'is_visible' => true,
        ]);

        // Create Privacy Policy Content Section
        Section::create([
            'page_id' => $page->id,
            'tenant_id' => $page->tenant_id ?? 1,
            'component_type' => 'legal_content',
            'content' => [
                'sections' => [
                    [
                        'title' => '1. Information We Collect',
                        'content' => '<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:</p>
<ul>
<li>Name and contact information (email, phone number, address)</li>
<li>Payment information</li>
<li>Health and wellness preferences</li>
<li>Communication preferences</li>
</ul>',
                    ],
                    [
                        'title' => '2. How We Use Your Information',
                        'content' => '<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve our services</li>
<li>Process transactions and send related information</li>
<li>Send promotional communications (with your consent)</li>
<li>Respond to your comments and questions</li>
<li>Personalize your experience</li>
</ul>',
                    ],
                    [
                        'title' => '3. Information Sharing',
                        'content' => '<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
<ul>
<li>To trusted service providers who assist us in operating our website</li>
<li>When required by law or to protect our rights</li>
<li>In connection with a merger, acquisition, or sale of assets</li>
</ul>',
                    ],
                    [
                        'title' => '4. Data Security',
                        'content' => '<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
<ul>
<li>SSL encryption for data transmission</li>
<li>Secure servers and databases</li>
<li>Regular security audits</li>
<li>Limited access to personal information by employees</li>
</ul>',
                    ],
                    [
                        'title' => '5. Cookies and Tracking',
                        'content' => '<p>We use cookies and similar tracking technologies to:</p>
<ul>
<li>Remember your preferences</li>
<li>Understand how you use our website</li>
<li>Improve our services</li>
<li>Provide personalized content</li>
</ul>
<p>You can control cookies through your browser settings.</p>',
                    ],
                    [
                        'title' => '6. Your Rights',
                        'content' => '<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate data</li>
<li>Request deletion of your data</li>
<li>Opt-out of marketing communications</li>
<li>Data portability</li>
</ul>',
                    ],
                    [
                        'title' => '7. Contact Us',
                        'content' => '<p>If you have questions about this Privacy Policy or our practices, please contact us at:</p>
<ul>
<li>Email: privacy@hyverx.com</li>
<li>Phone: (555) 123-4567</li>
<li>Address: 123 Wellness Street, Health City, HC 12345</li>
</ul>',
                    ],
                ],
            ],
            'styles' => [
                'background_color' => '#ffffff',
                'text_color' => '#6b6b6b',
                'heading_color' => '#3d3d3d',
                'padding_top' => 'md',
                'padding_bottom' => 'lg',
            ],
            'order' => 2,
            'is_visible' => true,
        ]);

        $this->command->info('Privacy Policy sections added successfully!');
    }
}
