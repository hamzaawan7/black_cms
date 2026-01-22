<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Page;
use App\Models\Section;

$page = Page::where('slug', 'partner-login')->first();
echo "Page ID: {$page->id}\n";

// Delete existing sections first
Section::where('page_id', $page->id)->delete();
echo "Deleted existing sections\n";

// Create section
$section = new Section();
$section->page_id = $page->id;
$section->component_type = 'partner_login';
$section->order = 1;
$section->is_visible = true;
$section->content = [
    'blocks' => [[
        'id' => 'partner-login-' . uniqid(),
        'type' => 'partner_login',
        'data' => [
            'hero' => [
                'icon_title' => 'Partner Access',
                'title' => 'Partner Portal',
                'description' => 'Welcome back! Sign in to your account.'
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
                'submitting_text' => 'SIGNING IN...'
            ],
            'signup_cta' => [
                'divider_text' => 'New to Hyve Wellness?',
                'description' => 'Join our network of healthcare professionals',
                'button_text' => 'BECOME A PARTNER',
                'button_link' => '/partners/signup'
            ],
            'footer' => [
                'help_text' => 'Need help?',
                'help_link_text' => 'Contact support',
                'help_link' => '/contact',
                'security_text' => 'Secured with 256-bit SSL encryption'
            ],
            'settings' => [
                'logo' => '/images/hyve-20logo-20-20350-20x-20100-20-20charcoal.png',
                'redirect_url' => 'https://partner.hyverx.com/'
            ]
        ],
        'settings' => ['visible' => true]
    ]]
];
$section->styles = ['background' => 'gradient', 'padding' => 'none'];
$section->settings = ['full_width' => true];
$section->save();

echo "Created section ID: {$section->id}\n";
echo "Sections count: " . Section::where('page_id', $page->id)->count() . "\n";
echo "Done!\n";
