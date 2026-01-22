<?php
/**
 * Seed About Page Blocks
 * Run: php seed_about_blocks.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Get about page
$aboutPage = DB::table('pages')->where('slug', 'about')->first();
if (!$aboutPage) {
    echo "About page not found!\n";
    exit(1);
}

$pageId = $aboutPage->id;

// Check existing sections
$existingSections = DB::table('sections')->where('page_id', $pageId)->pluck('component_type')->toArray();
echo "Existing sections: " . implode(', ', $existingSections) . "\n";

// ===== 1. Update Hero Section (already exists as hero_about) =====
echo "1. Updating hero_about section...\n";
$heroSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'hero_about')->first();
if ($heroSection) {
    $heroContent = json_decode($heroSection->content, true) ?: [];
    $heroContent['blocks'] = [[
        'id' => 'block_about_hero_' . time(),
        'type' => 'about_hero',
        'data' => [
            'preTitle' => 'HERE TO SERVE',
            'title' => 'About Us',
            'description' => 'Pioneering the future of personalized telehealth with compassion, innovation, and unwavering commitment to your wellness.',
            'primaryCtaText' => 'OUR TEAM',
            'primaryCtaLink' => '#team',
            'secondaryCtaText' => 'WHAT TO EXPECT',
            'secondaryCtaLink' => '#what-to-expect'
        ],
        'settings' => ['visibility' => 'visible']
    ]];
    DB::table('sections')->where('id', $heroSection->id)->update(['content' => json_encode($heroContent)]);
    echo "✓ hero_about updated\n";
} else {
    echo "✗ hero_about not found, creating...\n";
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'hero_about',
        'order' => 1,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_about_hero_' . time(),
                'type' => 'about_hero',
                'data' => [
                    'preTitle' => 'HERE TO SERVE',
                    'title' => 'About Us',
                    'description' => 'Pioneering the future of personalized telehealth with compassion, innovation, and unwavering commitment to your wellness.',
                    'primaryCtaText' => 'OUR TEAM',
                    'primaryCtaLink' => '#team',
                    'secondaryCtaText' => 'WHAT TO EXPECT',
                    'secondaryCtaLink' => '#what-to-expect'
                ],
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ hero_about created\n";
}

// ===== 2. Update Mission Section =====
echo "2. Updating mission section...\n";
$missionSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'mission')->first();
if ($missionSection) {
    $missionContent = json_decode($missionSection->content, true) ?: [];
    $missionContent['blocks'] = [[
        'id' => 'block_mission_' . time(),
        'type' => 'mission_section',
        'data' => [
            'preTitle' => 'OUR MISSION',
            'title' => 'Transforming Healthcare, One Patient at a Time',
            'description' => 'We launched Hyve Wellness with a simple ambition: Provide the highest quality virtual health services while maintaining exceptional individualized patient care. Our founders believe everyone deserves to look and feel their best.',
            'secondaryDescription' => 'Our founders believe everyone deserves to look and feel their best. We are committed to offering the best telehealth treatments, expert guidance, and personalized care to our patients nationwide.',
            'image' => '/storage/media/pages/img-8699.jpg',
            'points' => [
                ['text' => 'Personalized Care'],
                ['text' => 'Licensed Providers'],
                ['text' => 'Fast Delivery'],
                ['text' => '24/7 Support']
            ]
        ],
        'settings' => ['visibility' => 'visible']
    ]];
    DB::table('sections')->where('id', $missionSection->id)->update(['content' => json_encode($missionContent)]);
    echo "✓ mission updated\n";
} else {
    echo "✗ mission not found, creating...\n";
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'mission',
        'order' => 3,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_mission_' . time(),
                'type' => 'mission_section',
                'data' => [
                    'preTitle' => 'OUR MISSION',
                    'title' => 'Transforming Healthcare, One Patient at a Time',
                    'description' => 'We launched Hyve Wellness with a simple ambition: Provide the highest quality virtual health services while maintaining exceptional individualized patient care.',
                    'secondaryDescription' => 'Our founders believe everyone deserves to look and feel their best.',
                    'image' => '',
                    'points' => [
                        ['text' => 'Personalized Care'],
                        ['text' => 'Licensed Providers'],
                        ['text' => 'Fast Delivery'],
                        ['text' => '24/7 Support']
                    ]
                ],
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ mission created\n";
}

// ===== 3. Create Values Section (new) =====
echo "3. Creating values section...\n";
if (!in_array('values', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'values',
        'order' => 4,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_values_' . time(),
                'type' => 'values_cards',
                'data' => [
                    'preTitle' => 'OUR VALUES',
                    'title' => 'What Drives Us',
                    'items' => [
                        ['icon' => 'target', 'title' => 'Patient-Centered', 'description' => 'Your health goals guide everything we do'],
                        ['icon' => 'zap', 'title' => 'Innovation', 'description' => 'Cutting-edge telehealth technology'],
                        ['icon' => 'shield-check', 'title' => 'Trust', 'description' => 'Licensed providers you can rely on'],
                        ['icon' => 'diamond', 'title' => 'Excellence', 'description' => 'Premium quality in every interaction']
                    ]
                ],
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ values created\n";
} else {
    echo "✓ values already exists, updating...\n";
    $valuesSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'values')->first();
    $valuesContent = json_decode($valuesSection->content, true) ?: [];
    $valuesContent['blocks'] = [[
        'id' => 'block_values_' . time(),
        'type' => 'values_cards',
        'data' => [
            'preTitle' => 'OUR VALUES',
            'title' => 'What Drives Us',
            'items' => [
                ['icon' => 'target', 'title' => 'Patient-Centered', 'description' => 'Your health goals guide everything we do'],
                ['icon' => 'zap', 'title' => 'Innovation', 'description' => 'Cutting-edge telehealth technology'],
                ['icon' => 'shield-check', 'title' => 'Trust', 'description' => 'Licensed providers you can rely on'],
                ['icon' => 'diamond', 'title' => 'Excellence', 'description' => 'Premium quality in every interaction']
            ]
        ],
        'settings' => ['visibility' => 'visible']
    ]];
    DB::table('sections')->where('id', $valuesSection->id)->update(['content' => json_encode($valuesContent)]);
}

// ===== 4. Create Process (What to Expect) Section (new) =====
echo "4. Creating process section...\n";
if (!in_array('process', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'process',
        'order' => 5,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_process_' . time(),
                'type' => 'process_steps',
                'data' => [
                    'preTitle' => 'PLANNING YOUR VISIT',
                    'title' => 'What to Expect',
                    'description' => 'When you connect with us, you\'ll experience seamless virtual consultations with our expert team. Our telehealth platform makes premium care accessible from anywhere.',
                    'steps' => [
                        ['step' => '01', 'title' => 'Intake', 'description' => ['A short intake process', 'to assess your needs', 'and see if you\'re a good fit.'], 'image' => ''],
                        ['step' => '02', 'title' => 'Review', 'description' => ['Our medical team reviews', 'your intake form or, in some cases,', 'has a short consultation video call.'], 'image' => ''],
                        ['step' => '03', 'title' => 'Ship', 'description' => ['We send your medication', 'with 2-day shipping', 'straight to your doorstep.'], 'image' => '']
                    ]
                ],
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ process created\n";
} else {
    echo "✓ process already exists\n";
}

// ===== 5. Create CTA Section (new) =====
echo "5. Creating cta_about section...\n";
if (!in_array('cta_about', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'cta_about',
        'order' => 6,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_cta_' . time(),
                'type' => 'cta_section',
                'data' => [
                    'preTitle' => 'START YOUR JOURNEY',
                    'title' => 'Ready to Start Your Transformation?',
                    'description' => 'Join thousands of satisfied patients who have transformed their lives with Hyve Wellness.',
                    'primaryCtaText' => 'GET STARTED TODAY',
                    'primaryCtaLink' => '/services',
                    'secondaryCtaText' => 'CONTACT US',
                    'secondaryCtaLink' => '/contact'
                ],
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ cta_about created\n";
} else {
    echo "✓ cta_about already exists\n";
}

echo "\n✅ All About page blocks seeded successfully!\n";

// Show final sections
$finalSections = DB::table('sections')->where('page_id', $pageId)->orderBy('order')->get(['id', 'component_type', 'order']);
echo "\nFinal sections:\n";
foreach ($finalSections as $s) {
    echo "  {$s->order}. {$s->component_type} (id: {$s->id})\n";
}
