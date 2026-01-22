<?php

/**
 * Partner Login Page Seeder
 * 
 * This script seeds the partner-login page with proper block structure
 * 
 * Run with: php seed_partner_login.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Page;
use App\Models\PageSection;

echo "🚀 Starting Partner Login Page Seeder...\n\n";

// Find or create partner-login page
$page = Page::where('slug', 'partner-login')->first();

if (!$page) {
    $page = Page::create([
        'title' => 'Partner Login',
        'slug' => 'partner-login',
        'description' => 'Partner portal login page',
        'is_published' => true,
        'layout' => 'minimal',
        'meta_title' => 'Partner Login | Hyve Wellness',
        'meta_description' => 'Sign in to your Hyve Wellness partner portal',
    ]);
    echo "✅ Created new partner-login page\n";
} else {
    echo "📄 Found existing partner-login page (ID: {$page->id})\n";
    
    // Delete existing sections
    $deletedCount = PageSection::where('page_id', $page->id)->delete();
    echo "🗑️  Deleted {$deletedCount} existing sections\n";
}

// Partner Login Block Data
$partnerLoginBlock = [
    'id' => 'partner-login-' . uniqid(),
    'type' => 'partner_login',
    'data' => [
        'hero' => [
            'icon_title' => 'Partner Access',
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
    ],
    'settings' => [
        'visible' => true,
    ],
];

// Create section with block
$section = PageSection::create([
    'page_id' => $page->id,
    'component_type' => 'partner_login',
    'order' => 1,
    'is_visible' => true,
    'content' => [
        'blocks' => [$partnerLoginBlock],
    ],
    'styles' => [
        'background' => 'gradient',
        'padding' => 'none',
    ],
    'settings' => [
        'full_width' => true,
    ],
]);

echo "✅ Created Partner Login section with block\n";

echo "\n";
echo "========================================\n";
echo "✅ Partner Login Page Seeding Complete!\n";
echo "========================================\n";
echo "\n";
echo "📋 Summary:\n";
echo "   - Page: partner-login (ID: {$page->id})\n";
echo "   - Section: partner_login with partner_login block\n";
echo "\n";
echo "🔄 Next steps:\n";
echo "   1. Go to CMS Admin → Pages → Partner Login\n";
echo "   2. Use Blocks tab to edit login form content\n";
echo "   3. Changes will reflect on frontend\n";
echo "\n";
