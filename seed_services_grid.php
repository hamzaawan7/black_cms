<?php
/**
 * Services Grid Block Seeder
 * 
 * This script seeds the Services Grid block with existing services data.
 * Run with: php seed_services_grid.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🚀 Seeding Services Grid Block...\n\n";

// Get Services page ID
$servicesPage = DB::table('pages')->where('slug', 'services')->first();

if (!$servicesPage) {
    echo "❌ Services page not found.\n";
    exit(1);
}

$pageId = $servicesPage->id;
echo "✓ Services page found with ID: {$pageId}\n";

// Get existing services from database
$services = DB::table('services')
    ->leftJoin('service_categories', 'services.category_id', '=', 'service_categories.id')
    ->select([
        'services.id',
        'services.name',
        'services.slug',
        'services.description',
        'services.headline',
        'services.pricing',
        'services.image',
        'services.is_popular',
        'service_categories.name as category_name',
        'service_categories.slug as category_slug',
    ])
    ->orderBy('services.id')
    ->get();

echo "✓ Found " . count($services) . " services\n\n";

// Transform services to block format
$servicesData = [];
foreach ($services as $service) {
    $servicesData[] = [
        'id' => 'service_' . $service->id,
        'name' => $service->name,
        'slug' => $service->slug,
        'category' => $service->category_name ?? 'General',
        'categorySlug' => $service->category_slug ?? 'general',
        'description' => $service->description ?? '',
        'headline' => $service->headline ?? '',
        'pricing' => $service->pricing ?? '',
        'image' => $service->image ?? '',
        'isPopular' => (bool)$service->is_popular,
    ];
}

$gridBlockData = [
    'title' => 'Our Treatments',
    'description' => 'Browse our comprehensive range of wellness treatments',
    'services' => $servicesData,
    'displayStyle' => 'grid',
    'columns' => 3,
];

// Check if services_grid section exists
$existingSection = DB::table('sections')
    ->where('page_id', $pageId)
    ->where('component_type', 'services_grid')
    ->first();

if (!$existingSection) {
    // Get current max order
    $maxOrder = DB::table('sections')
        ->where('page_id', $pageId)
        ->max('order') ?? 0;
    
    DB::table('sections')->insert([
        'page_id' => $pageId,
        'component_type' => 'services_grid',
        'order' => 2, // After hero, before categories
        'is_visible' => true,
        'content' => json_encode([
            'blocks' => [[
                'id' => 'block_services_grid_' . time(),
                'type' => 'services_grid',
                'data' => $gridBlockData,
                'settings' => ['visibility' => 'visible']
            ]]
        ]),
        'styles' => json_encode([]),
        'settings' => json_encode([]),
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ services_grid section created\n";
} else {
    // Update existing
    $content = json_decode($existingSection->content, true) ?: [];
    $content['blocks'] = [[
        'id' => 'block_services_grid_' . time(),
        'type' => 'services_grid',
        'data' => $gridBlockData,
        'settings' => ['visibility' => 'visible']
    ]];
    
    DB::table('sections')
        ->where('id', $existingSection->id)
        ->update(['content' => json_encode($content)]);
    
    echo "✓ services_grid section updated\n";
}

// Reorder sections properly
DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_hero')->update(['order' => 1]);
DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_grid')->update(['order' => 2]);
DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_categories')->update(['order' => 3]);
DB::table('sections')->where('page_id', $pageId)->where('component_type', 'services_cta')->update(['order' => 4]);

echo "✓ Sections reordered\n";

// Show final state
$final = DB::table('sections')
    ->where('page_id', $pageId)
    ->orderBy('order')
    ->get(['id', 'component_type', 'order']);

echo "\n✅ Final sections for Services page:\n";
foreach ($final as $s) {
    echo "  - {$s->component_type} (order: {$s->order}, id: {$s->id})\n";
}

echo "\n🎉 Done! Services Grid block now contains " . count($servicesData) . " services.\n";
