<?php
/**
 * Seed FAQ and Contact blocks into sections
 * Run: php seed_faq_contact_blocks.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// ===== Seed FAQ Block =====
echo "Seeding FAQ block...\n";

$faqSection = DB::table('sections')->where('id', 5)->first();
$faqContent = json_decode($faqSection->content, true);

$faqBlock = [
    'id' => 'block_faq_list_' . time(),
    'type' => 'faq_list',
    'data' => [
        'preTitle' => 'GOT QUESTIONS?',
        'title' => 'Frequently Asked Questions',
        'description' => 'Find answers to common questions about our telehealth services, treatments, and how to get started on your wellness journey.',
        'items' => [
            [
                'question' => 'How does telehealth work with Hyve Wellness?',
                'answer' => 'Our telehealth platform connects you with licensed healthcare providers through secure virtual consultations. After completing a brief health assessment, you\'ll have a video or phone consultation to discuss your health goals. If appropriate, prescriptions are sent directly to your pharmacy.'
            ],
            [
                'question' => 'What services can I access through telehealth?',
                'answer' => 'Hyve Wellness offers comprehensive virtual health services including weight management programs (Semaglutide, Tirzepatide), longevity treatments (NAD+, peptides), hormone optimization, skin health solutions, brain and mood support, and personalized wellness plans.'
            ],
            [
                'question' => 'How quickly can I get started with treatment?',
                'answer' => 'Most patients can schedule a consultation within 24-48 hours. After your virtual consultation, if treatment is prescribed, medications are typically shipped within 3-5 business days. For weight management programs, many patients start seeing results within the first month.'
            ],
            [
                'question' => 'Do you accept insurance?',
                'answer' => 'Currently, most of our services are not covered by traditional insurance as they focus on preventive care and wellness optimization. However, we offer competitive cash-pay pricing and flexible payment plans to make our services accessible. Some HSA/FSA cards may be accepted.'
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and select HSA/FSA cards. We also offer wellness membership plans that provide discounted rates and exclusive benefits.'
            ]
        ],
        'ctaTitle' => 'Still have questions?',
        'ctaDescription' => 'Our support team is here to help you 24/7.',
        'ctaText' => 'Contact Support',
        'ctaLink' => '/contact'
    ],
    'settings' => ['visibility' => 'visible']
];

$faqContent['blocks'] = [$faqBlock];
DB::table('sections')->where('id', 5)->update(['content' => json_encode($faqContent)]);
echo "✓ FAQ block seeded successfully!\n";

// ===== Seed Contact Block =====
echo "Seeding Contact block...\n";

$contactSection = DB::table('sections')->where('id', 6)->first();
$contactContent = json_decode($contactSection->content, true);

$contactBlock = [
    'id' => 'block_contact_info_' . time(),
    'type' => 'contact_info',
    'data' => [
        'preTitle' => 'GET IN TOUCH',
        'title' => 'We Would Love To Hear From You',
        'description' => 'Have questions about our services? Ready to start your wellness journey? We\'re here to help.',
        'phone' => '1-800-HYVE-RX',
        'phoneHours' => 'Mon-Fri 8am to 8pm EST',
        'email' => 'support@hyverx.com',
        'emailResponse' => 'We\'ll respond within 24 hours',
        'hours' => '24/7 Support',
        'hoursDescription' => 'Always here when you need us',
        'image' => '',
        'imageTitle' => 'Start Your Journey Today',
        'imageSubtitle' => 'Personalized care, delivered to your door'
    ],
    'settings' => ['visibility' => 'visible']
];

$contactContent['blocks'] = [$contactBlock];
DB::table('sections')->where('id', 6)->update(['content' => json_encode($contactContent)]);
echo "✓ Contact block seeded successfully!\n";

echo "\nDone! Both blocks have been seeded.\n";
