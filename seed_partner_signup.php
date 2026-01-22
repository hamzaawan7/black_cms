<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Page;
use App\Models\Section;

echo "🚀 Starting Partner Signup Page Seeder...\n\n";

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

// Create section with partner_signup block
$section = new Section();
$section->page_id = $page->id;
$section->component_type = 'partner_signup';
$section->order = 1;
$section->is_visible = true;
$section->content = [
    'blocks' => [[
        'id' => 'partner-signup-' . uniqid(),
        'type' => 'partner_signup',
        'data' => [
            'hero' => [
                'pre_title' => 'WELLNESS PARTNERSHIP PROGRAM',
                'title' => 'Share Wellness.',
                'title_highlight' => 'Build Your Business.',
                'description' => 'Are you passionate about health and wellness? Join our community of wellness advocates, fitness professionals, influencers, and community leaders who are helping people access quality telehealth services while earning meaningful income.',
                'image' => '',
            ],
            'partner_types' => [
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
            'benefits' => [
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
            'how_it_works' => [
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
            'community' => [
                'title' => 'Join Our Partner Community',
                'description' => "When you become a Hyve Wellness partner, you're not just earning income - you're joining a supportive community of like-minded wellness advocates. Share strategies, celebrate wins, and grow together with people who share your passion for helping others live their healthiest lives.",
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
        ],
        'settings' => ['visible' => true]
    ]]
];
$section->styles = ['background' => 'default', 'padding' => 'normal'];
$section->settings = ['full_width' => true];
$section->save();

echo "✅ Created Partner Signup section with block (ID: {$section->id})\n";
echo "\n";
echo "========================================\n";
echo "✅ Partner Signup Page Seeding Complete!\n";
echo "========================================\n";
echo "\n";
echo "📋 Summary:\n";
echo "   - Page: partner-signup (ID: {$page->id})\n";
echo "   - Section: partner_signup with partner_signup block\n";
echo "\n";
echo "🔄 Next steps:\n";
echo "   1. Go to CMS Admin → Pages → Become a Partner\n";
echo "   2. Use Blocks tab to edit signup page content\n";
echo "   3. Changes will reflect on frontend\n";
echo "\n";
