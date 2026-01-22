<?php

/**
 * Seed Contact Page Blocks
 * 
 * This script creates CMS sections for the Contact page
 * with all the block types: contact_hero, contact_form, contact_info_cards, contact_cta
 * 
 * Run: php seed_contact_blocks.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🚀 Starting Contact Page Block Seeder...\n\n";

// First, find the Contact page
$contactPage = DB::table('pages')->where('slug', 'contact')->first();

if (!$contactPage) {
    echo "❌ Contact page not found. Creating it...\n";
    
    $pageId = DB::table('pages')->insertGetId([
        'title' => 'Contact',
        'slug' => 'contact',
        'meta_title' => 'Contact Us - Hyve Wellness',
        'meta_description' => 'Get in touch with our team',
        'is_published' => true,
        'content' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ Created Contact page with ID: {$pageId}\n";
} else {
    $pageId = $contactPage->id;
    echo "✅ Found Contact page with ID: {$pageId}\n";
}

// Clear existing sections for this page
$deleted = DB::table('sections')->where('page_id', $pageId)->delete();
echo "🗑️  Cleared {$deleted} existing sections\n\n";

// Define the blocks to create
$blocks = [
    // 1. Contact Hero
    [
        'page_id' => $pageId,
        'component_type' => 'contact_hero',
        'order' => 1,
        'is_visible' => true,
        'content' => json_encode([
            'preTitle' => 'GET IN TOUCH',
            'title' => 'Contact Us',
            'description' => 'Have questions about our services? We\'re here to help. Fill out the form below and our team will get back to you shortly.',
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 2. Contact Form
    [
        'page_id' => $pageId,
        'component_type' => 'contact_form',
        'order' => 2,
        'is_visible' => true,
        'content' => json_encode([
            'title' => 'Send Us a Message',
            'subtitle' => 'We\'d love to hear from you',
            'successTitle' => 'Thank You!',
            'successMessage' => 'Your message has been received. Our team will review your inquiry and get back to you within 24-48 hours.',
            'submitText' => 'SEND MESSAGE',
            'fields' => [
                'name' => [
                    'label' => 'Full Name',
                    'placeholder' => 'John Doe',
                    'required' => true,
                ],
                'email' => [
                    'label' => 'Email Address',
                    'placeholder' => 'john@example.com',
                    'required' => true,
                ],
                'phone' => [
                    'label' => 'Phone Number',
                    'placeholder' => '(555) 123-4567',
                    'required' => false,
                ],
                'message' => [
                    'label' => 'How can we help you?',
                    'placeholder' => 'Tell us about your questions or how we can assist you...',
                    'required' => true,
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 3. Contact Info Cards
    [
        'page_id' => $pageId,
        'component_type' => 'contact_info_cards',
        'order' => 3,
        'is_visible' => true,
        'content' => json_encode([
            'columns' => 3,
            'cards' => [
                [
                    'id' => 'card_phone_001',
                    'icon' => 'phone',
                    'title' => 'Call Us',
                    'value' => '1-800-HYVE-RX',
                    'description' => 'Mon-Fri 8am-8pm EST',
                    'link' => 'tel:1-800-HYVE-RX',
                ],
                [
                    'id' => 'card_email_002',
                    'icon' => 'email',
                    'title' => 'Email Us',
                    'value' => 'support@hyverx.com',
                    'description' => 'We respond within 24 hours',
                    'link' => 'mailto:support@hyverx.com',
                ],
                [
                    'id' => 'card_hours_003',
                    'icon' => 'clock',
                    'title' => 'Hours',
                    'value' => '24/7 Support',
                    'description' => 'Always here when you need us',
                    'link' => '',
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 4. Contact CTA
    [
        'page_id' => $pageId,
        'component_type' => 'contact_cta',
        'order' => 4,
        'is_visible' => true,
        'content' => json_encode([
            'icon' => 'phone',
            'title' => 'Prefer to speak with someone now?',
            'description' => 'Our patient care team is available to answer your questions and help you get started.',
            'buttonText' => 'Schedule a Call',
            'buttonLink' => '#',
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
];

// Insert the blocks
foreach ($blocks as $block) {
    DB::table('sections')->insert($block);
    echo "✅ Created: {$block['component_type']} (order: {$block['order']})\n";
}

echo "\n========================================\n";
echo "✅ Contact page blocks seeded successfully!\n";
echo "========================================\n\n";

// Show summary
$sections = DB::table('sections')
    ->where('page_id', $pageId)
    ->orderBy('order')
    ->get();

echo "📋 Contact Page Sections Summary:\n";
echo str_repeat('-', 50) . "\n";

foreach ($sections as $section) {
    $status = $section->is_visible ? '✅' : '❌';
    echo "{$status} [{$section->order}] {$section->component_type}\n";
}

echo "\n🎉 Done! Visit the Contact page in the CMS to edit these blocks.\n";
echo "   Admin URL: http://127.0.0.1:8000/admin/pages/contact/sections\n";
