<?php

/**
 * Seed Contact Page Blocks - Version 2
 * 
 * This script creates CMS sections for the Contact page
 * with blocks inside content.blocks array (consistent with other pages)
 * 
 * Run: php seed_contact_blocks_v2.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🚀 Starting Contact Page Block Seeder v2...\n\n";

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

// Helper function to generate unique block IDs
function generateBlockId($prefix = 'block') {
    return $prefix . '_' . time() . '_' . bin2hex(random_bytes(4));
}

// Define the sections with blocks inside content.blocks
$sections = [
    // 1. Contact Hero Section
    [
        'page_id' => $pageId,
        'component_type' => 'contact_hero',
        'order' => 1,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [
                [
                    'id' => generateBlockId('heading'),
                    'type' => 'heading',
                    'data' => [
                        'text' => 'GET IN TOUCH',
                        'level' => 'pretitle',
                        'alignment' => 'center',
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
                [
                    'id' => generateBlockId('heading'),
                    'type' => 'heading',
                    'data' => [
                        'text' => 'Contact Us',
                        'level' => 'h1',
                        'alignment' => 'center',
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
                [
                    'id' => generateBlockId('text'),
                    'type' => 'text',
                    'data' => [
                        'content' => 'Have questions about our services? We\'re here to help. Fill out the form below and our team will get back to you shortly.',
                        'alignment' => 'center',
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 2. Contact Form Section
    [
        'page_id' => $pageId,
        'component_type' => 'contact_form',
        'order' => 2,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [
                [
                    'id' => generateBlockId('contact_form'),
                    'type' => 'contact_form',
                    'data' => [
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
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 3. Contact Info Cards Section
    [
        'page_id' => $pageId,
        'component_type' => 'contact_info_cards',
        'order' => 3,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [
                [
                    'id' => generateBlockId('contact_info_cards'),
                    'type' => 'contact_info_cards',
                    'data' => [
                        'cards' => [
                            [
                                'id' => 'card_phone',
                                'icon' => 'phone',
                                'title' => 'Call Us',
                                'value' => '1-800-HYVE-RX',
                                'description' => 'Mon-Fri 8am-8pm EST',
                                'link' => 'tel:1-800-HYVE-RX',
                            ],
                            [
                                'id' => 'card_email',
                                'icon' => 'email',
                                'title' => 'Email Us',
                                'value' => 'support@hyverx.com',
                                'description' => 'We respond within 24 hours',
                                'link' => 'mailto:support@hyverx.com',
                            ],
                            [
                                'id' => 'card_hours',
                                'icon' => 'clock',
                                'title' => 'Hours',
                                'value' => '24/7 Support',
                                'description' => 'Always here when you need us',
                                'link' => '',
                            ],
                        ],
                        'columns' => 3,
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
    
    // 4. Contact CTA Section
    [
        'page_id' => $pageId,
        'component_type' => 'contact_cta',
        'order' => 4,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [
                [
                    'id' => generateBlockId('contact_cta'),
                    'type' => 'contact_cta',
                    'data' => [
                        'icon' => 'phone',
                        'title' => 'Prefer to speak with someone now?',
                        'description' => 'Our patient care team is available to answer your questions and help you get started on your wellness journey.',
                        'buttonText' => 'Schedule a Call',
                        'buttonLink' => '#',
                    ],
                    'settings' => ['visibility' => 'visible'],
                ],
            ],
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now(),
    ],
];

// Insert each section
foreach ($sections as $index => $section) {
    DB::table('sections')->insert($section);
    $sectionNum = $index + 1;
    echo "✅ Created section {$sectionNum}: {$section['component_type']}\n";
}

echo "\n🎉 Contact page sections created successfully!\n";
echo "📝 Total sections: " . count($sections) . "\n";
echo "\n💡 Each section now has blocks in content.blocks array.\n";
echo "   Go to CMS > Pages > Contact > Edit any section > Blocks tab\n";
