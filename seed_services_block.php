<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;
use App\Models\ServiceCategory;

echo "=== Seeding Services Carousel Block ===\n\n";

// Get categories with services
$categories = ServiceCategory::with('services')->where('is_active', true)->orderBy('order')->get();

echo "Found " . count($categories) . " active categories\n";

// Get services_grid section
$section = Section::where('component_type', 'services_grid')->first();

if ($section) {
    $content = $section->content;
    
    // Create services_carousel block with categories data
    // Format to match frontend ServiceCategory interface:
    // { category: string, slug: string, image: string, items: Service[] }
    $servicesCarouselBlock = [
        'id' => 'block_services_' . time(),
        'type' => 'services_carousel',
        'data' => [
            'categories' => $categories->map(function($cat) {
                return [
                    'category' => $cat->name,  // Frontend uses 'category' not 'name'
                    'slug' => $cat->slug,
                    'image' => $cat->image ?? '/images/1.png',  // Default image
                    'items' => $cat->services->map(function($s) use ($cat) {  // Frontend uses 'items' not 'services'
                        return [
                            'name' => $s->name,
                            'slug' => $s->slug,
                            'description' => $s->description ?? '',
                            'image' => $s->image ?? '/images/1.png',
                            'popular' => $s->is_popular ?? false,  // Frontend uses 'popular' not 'is_popular'
                            // Additional fields for service detail pages
                            'category' => $cat->name,
                            'categorySlug' => $cat->slug,
                        ];
                    })->toArray(),
                ];
            })->toArray(),
            'showCategoryImages' => true,
            'showServicesList' => true,
            'columns' => 4,
        ],
        'settings' => ['visibility' => 'visible'],
    ];
    
    $content['blocks'] = [$servicesCarouselBlock];
    $section->content = $content;
    $section->save();
    
    echo "Services Grid updated with " . count($categories) . " categories!\n";
    
    // Show categories
    foreach ($categories as $cat) {
        echo "  - {$cat->name}: " . count($cat->services) . " services\n";
    }
} else {
    echo "Services Grid section not found\n";
}

echo "\n=== Done! ===\n";
