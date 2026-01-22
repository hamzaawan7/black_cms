<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Page;
use App\Models\Section;

echo "🚀 Starting Partner Signup Page Seeder (v2 - Multiple Sections)...\n\n";

// Find or create partner-signup page
$page = Page::where('slug', 'partner-signup')->first();

if (!$page) {
    $page = Page::create([
        'title' => 'Become a Partner',
        'slug' => 'partner-signup',
        'description' => 'Partner signup page',
        'is_published' => true,
        'layout' => 'default',
        'meta_title' => 'Become a Partner | Hyve Wellness',
        'meta_description' => 'Join our network of healthcare professionals and wellness advocates',
    ]);
    echo "✅ Created new partner-signup page\n";
} else {
    echo "📄 Found existing partner-signup page (ID: {$page->id})\n";
    
    // Delete existing sections
    $deletedCount = Section::where('page_id', $page->id)->delete();
    echo "🗑️  Deleted {$deletedCount} existing sections\n";
}

// ============================================
// Section 1: Hero
// ============================================
$section1 = new Section();
$section1->page_id = $page->id;
$section1->component_type = 'partner_signup_hero';
$section1->order = 1;
$section1->is_visible = true;
$section1->content = [
    'blocks' => [[
        'id' => 'partner-signup-hero-' . uniqid(),
        'type' => 'partner_signup_hero',
        'data' => [
            'pre_title' => 'WELLNESS PARTNERSHIP PROGRAM',
            'title' => 'Share Wellness.',
            'title_highlight' => 'Build Your Business.',
            'description' => 'Are you passionate about health and wellness? Join our community of wellness advocates, fitness professionals, influencers, and community leaders who are helping people access quality telehealth services while earning meaningful income.',
            'logo' => '/images/hyve-20logo-20-20350-20x-20100-20-20champagne-20gold.png',
        ],
        'settings' => ['visible' => true]
    ]]
];
$section1->styles = ['background' => 'gradient', 'padding' => 'large'];
$section1->settings = ['full_width' => true];
$section1->save();
echo "✅ Created Hero section (ID: {$section1->id})\n";

// ============================================
// Section 2: Partner Types
// ============================================
$section2 = new Section();
$section2->page_id = $page->id;
$section2->component_type = 'partner_signup_types';
$section2->order = 2;
$section2->is_visible = true;
$section2->content = [
    'blocks' => [[
        'id' => 'partner-signup-types-' . uniqid(),
        'type' => 'partner_signup_types',
        'data' => [
            'title' => "Who We're Looking For",
            'description' => 'Our partnership program is designed for people who genuinely care about helping others live healthier lives.',
            'items' => [
                [
                    'icon' => 'Users',
                    'title' => 'Community Leaders',
                    'description' => 'Coaches, mentors, and organizers with trusted networks',
                    'gradient' => 'from-[#c9a962] to-[#d4c4a8]'
                ],
                [
                    'icon' => 'Heart',
                    'title' => 'Wellness Professionals',
                    'description' => 'Personal trainers, nutritionists, yoga instructors, and health coaches',
                    'gradient' => 'from-[#9a8b7a] to-[#c9a962]'
                ],
                [
                    'icon' => 'TrendingUp',
                    'title' => 'Content Creators',
                    'description' => 'Health influencers and educators with engaged audiences',
                    'gradient' => 'from-[#d4c4a8] to-[#9a8b7a]'
                ],
            ],
        ],
        'settings' => ['visible' => true]
    ]]
];
$section2->styles = ['background' => 'white', 'padding' => 'normal'];
$section2->settings = ['full_width' => false];
$section2->save();
echo "✅ Created Partner Types section (ID: {$section2->id})\n";

// ============================================
// Section 3: Benefits
// ============================================
$section3 = new Section();
$section3->page_id = $page->id;
$section3->component_type = 'partner_signup_benefits';
$section3->order = 3;
$section3->is_visible = true;
$section3->content = [
    'blocks' => [[
        'id' => 'partner-signup-benefits-' . uniqid(),
        'type' => 'partner_signup_benefits',
        'data' => [
            'title' => "What You'll Get",
            'items' => [
                [
                    'icon' => 'DollarSign',
                    'title' => 'Competitive Commission Structure',
                    'description' => 'Earn recurring income on every wellness membership you bring to Hyve Wellness. Build a sustainable book of business with our generous commission model designed for long-term success.'
                ],
                [
                    'icon' => 'GraduationCap',
                    'title' => 'Comprehensive Training',
                    'description' => "Access our health education library, sales training programs, and product knowledge courses. We'll equip you with everything you need to confidently share our services."
                ],
                [
                    'icon' => 'Headphones',
                    'title' => 'Full Support System',
                    'description' => "Our dedicated partner success team provides medical expertise, marketing materials, and ongoing support. You're never alone in helping your clients achieve their wellness goals."
                ],
                [
                    'icon' => 'CheckCircle2',
                    'title' => 'Low-Cost Pricing Model',
                    'description' => 'Offer your community access to premium telehealth services at accessible price points. Our membership model makes quality care achievable for everyone you serve.'
                ],
            ],
        ],
        'settings' => ['visible' => true]
    ]]
];
$section3->styles = ['background' => 'cream', 'padding' => 'normal'];
$section3->settings = ['full_width' => false];
$section3->save();
echo "✅ Created Benefits section (ID: {$section3->id})\n";

// ============================================
// Section 4: How It Works (Steps)
// ============================================
$section4 = new Section();
$section4->page_id = $page->id;
$section4->component_type = 'partner_signup_steps';
$section4->order = 4;
$section4->is_visible = true;
$section4->content = [
    'blocks' => [[
        'id' => 'partner-signup-steps-' . uniqid(),
        'type' => 'partner_signup_steps',
        'data' => [
            'title' => 'How It Works',
            'steps' => [
                [
                    'number' => '1',
                    'title' => 'Apply to Join',
                    'description' => "Tell us about yourself and your passion for wellness. We'll review your application and schedule a call to learn more about your goals."
                ],
                [
                    'number' => '2',
                    'title' => 'Get Trained & Certified',
                    'description' => "Complete our partner onboarding program. Learn about our treatments, membership options, and how to best serve your community's health needs."
                ],
                [
                    'number' => '3',
                    'title' => 'Share With Your Community',
                    'description' => 'Use your unique partner link and resources to introduce wellness memberships to your audience. Help people access telehealth services that can transform their lives.'
                ],
                [
                    'number' => '4',
                    'title' => 'Earn & Grow',
                    'description' => 'Receive commissions on every membership. As your client base grows, so does your recurring income. Join our community of partners making a real difference.'
                ],
            ],
        ],
        'settings' => ['visible' => true]
    ]]
];
$section4->styles = ['background' => 'white', 'padding' => 'normal'];
$section4->settings = ['full_width' => false];
$section4->save();
echo "✅ Created Steps section (ID: {$section4->id})\n";

// ============================================
// Section 5: Community
// ============================================
$section5 = new Section();
$section5->page_id = $page->id;
$section5->component_type = 'partner_signup_community';
$section5->order = 5;
$section5->is_visible = true;
$section5->content = [
    'blocks' => [[
        'id' => 'partner-signup-community-' . uniqid(),
        'type' => 'partner_signup_community',
        'data' => [
            'title' => 'Join Our Partner Community',
            'description' => "When you become a Hyve Wellness partner, you're not just earning income - you're joining a supportive community of like-minded wellness advocates. Share strategies, celebrate wins, and grow together with people who share your passion for helping others live their healthiest lives.",
            'stats' => [
                ['icon' => 'Shield', 'text' => 'Trusted by 500+ partners'],
                ['icon' => 'Users', 'text' => 'Active community support'],
            ],
        ],
        'settings' => ['visible' => true]
    ]]
];
$section5->styles = ['background' => 'cream', 'padding' => 'normal'];
$section5->settings = ['full_width' => false];
$section5->save();
echo "✅ Created Community section (ID: {$section5->id})\n";

// ============================================
// Section 6: CTA
// ============================================
$section6 = new Section();
$section6->page_id = $page->id;
$section6->component_type = 'partner_signup_cta';
$section6->order = 6;
$section6->is_visible = true;
$section6->content = [
    'blocks' => [[
        'id' => 'partner-signup-cta-' . uniqid(),
        'type' => 'partner_signup_cta',
        'data' => [
            'title' => 'Ready to Make an Impact?',
            'description' => 'Turn your passion for wellness into a rewarding opportunity. Help your community access quality healthcare while building a business you can be proud of.',
            'button_text' => 'APPLY NOW',
            'button_link' => '#',
            'login_text' => 'Already a partner?',
            'login_link_text' => 'Sign in to your portal',
            'login_link' => '/partners/login',
        ],
        'settings' => ['visible' => true]
    ]]
];
$section6->styles = ['background' => 'white', 'padding' => 'large'];
$section6->settings = ['full_width' => false];
$section6->save();
echo "✅ Created CTA section (ID: {$section6->id})\n";

echo "\n";
echo "========================================\n";
echo "✅ Partner Signup Page Seeding Complete!\n";
echo "========================================\n";
echo "\n";
echo "📋 Summary:\n";
echo "   - Page: partner-signup (ID: {$page->id})\n";
echo "   - 6 Sections created with separate blocks:\n";
echo "     1. partner_signup_hero\n";
echo "     2. partner_signup_types\n";
echo "     3. partner_signup_benefits\n";
echo "     4. partner_signup_steps\n";
echo "     5. partner_signup_community\n";
echo "     6. partner_signup_cta\n";
echo "\n";
echo "🔄 Next steps:\n";
echo "   1. Go to CMS Admin → Pages → Become a Partner\n";
echo "   2. Each section can be styled independently\n";
echo "   3. Use Blocks tab to edit section content\n";
echo "\n";
