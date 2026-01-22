<?php
/**
 * Services Page Blocks Seeder
 * 
 * This script seeds the Services page sections with block-based content.
 * Run with: php seed_services_blocks.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🚀 Seeding Services Page Blocks...\n\n";

// Get Services page ID
$servicesPage = DB::table('pages')->where('slug', 'services')->first();

if (!$servicesPage) {
    echo "❌ Services page not found. Creating it...\n";
    $pageId = DB::table('pages')->insertGetId([
        'name' => 'Services',
        'slug' => 'services',
        'title' => 'Our Services | Hyve Wellness',
        'content' => json_encode([]),
        'is_published' => true,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ Services page created with ID: {$pageId}\n";
} else {
    $pageId = $servicesPage->id;
    echo "✓ Services page found with ID: {$pageId}\n";
}

// Check existing sections
$existingSections = DB::table('sections')
    ->where('page_id', $pageId)
    ->pluck('component_type')
    ->toArray();

echo "Existing sections: " . implode(', ', $existingSections) . "\n\n";

// ===== 1. Create Services Hero Section =====
echo "1. Creating services_hero section...\n";

$heroBlockData = [
    'preTitle' => 'OUR SERVICES',
    'title' => 'A renewing experience',
    'titleHighlight' => 'awaits you.',
    'description' => '',
];

if (!in_array('services_hero', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'services_hero',
        'order' => 1,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_services_hero_' . time(),
                'type' => 'services_hero',
                'data' => $heroBlockData,
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([
            'background_color' => '#f5f2eb',
        ]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ services_hero created\n";
} else {
    echo "✓ services_hero already exists, updating...\n";
    $heroSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_hero')->first();
    if ($heroSection) {
        $heroContent = json_decode($heroSection->content, true) ?: [];
        $heroContent['blocks'] = [[
            'id' => 'block_services_hero_' . time(),
            'type' => 'services_hero',
            'data' => $heroBlockData,
            'settings' => ['visibility' => 'visible']
        ]];
        DB::table('sections')->where('id', $heroSection->id)->update(['content' => json_encode($heroContent)]);
    }
}

// ===== 2. Create Services Categories Section =====
echo "2. Creating services_categories section...\n";

$categoriesBlockData = [
    'categories' => [
        ['name' => 'All', 'slug' => 'all', 'description' => 'View all services', 'image' => ''],
        ['name' => 'Weight Loss', 'slug' => 'weight-loss', 'description' => 'Weight management treatments', 'image' => ''],
        ['name' => 'Sexual Health', 'slug' => 'sexual-health', 'description' => 'Sexual wellness treatments', 'image' => ''],
        ['name' => 'Longevity', 'slug' => 'longevity', 'description' => 'Anti-aging treatments', 'image' => ''],
        ['name' => 'Hair', 'slug' => 'hair', 'description' => 'Hair restoration treatments', 'image' => ''],
        ['name' => 'Skin', 'slug' => 'skin', 'description' => 'Skin care treatments', 'image' => ''],
        ['name' => 'Brain & Mood', 'slug' => 'brain-and-mood', 'description' => 'Cognitive enhancement', 'image' => ''],
        ['name' => 'Hormones', 'slug' => 'hormones', 'description' => 'Hormone therapy', 'image' => ''],
    ]
];

if (!in_array('services_categories', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'services_categories',
        'order' => 2,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_services_categories_' . time(),
                'type' => 'services_categories',
                'data' => $categoriesBlockData,
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ services_categories created\n";
} else {
    echo "✓ services_categories already exists, updating...\n";
    $catSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_categories')->first();
    if ($catSection) {
        $catContent = json_decode($catSection->content, true) ?: [];
        $catContent['blocks'] = [[
            'id' => 'block_services_categories_' . time(),
            'type' => 'services_categories',
            'data' => $categoriesBlockData,
            'settings' => ['visibility' => 'visible']
        ]];
        DB::table('sections')->where('id', $catSection->id)->update(['content' => json_encode($catContent)]);
    }
}

// ===== 3. Create Services CTA Section =====
echo "3. Creating services_cta section...\n";

$ctaBlockData = [
    'preTitle' => 'Have Questions?',
    'title' => "We're here to help",
    'buttonText' => 'CONTACT US',
    'buttonLink' => '/contact'
];

if (!in_array('services_cta', $existingSections)) {
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'services_cta',
        'order' => 3,
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_services_cta_' . time(),
                'type' => 'services_cta',
                'data' => $ctaBlockData,
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([
            'background_color' => '#f5f2eb',
        ]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ services_cta created\n";
} else {
    echo "✓ services_cta already exists, updating...\n";
    $ctaSection = DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_cta')->first();
    if ($ctaSection) {
        $ctaContent = json_decode($ctaSection->content, true) ?: [];
        $ctaContent['blocks'] = [[
            'id' => 'block_services_cta_' . time(),
            'type' => 'services_cta',
            'data' => $ctaBlockData,
            'settings' => ['visibility' => 'visible']
        ]];
        DB::table('sections')->where('id', $ctaSection->id)->update(['content' => json_encode($ctaContent)]);
    }
}

echo "\n✅ All Services page blocks seeded successfully!\n";

// Show final sections
$finalSections = DB::table('sections')
    ->where('page_id', $pageId)
    ->orderBy('order')
    ->get(['id', 'component_type', 'order']);

echo "\nFinal sections for Services page:\n";
foreach ($finalSections as $section) {
    echo "  - {$section->component_type} (order: {$section->order}, id: {$section->id})\n";
}
