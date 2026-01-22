<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;
use App\Models\Tenant;
use App\Models\Page;

echo "=== Seeding Team Images Block ===\n\n";

// Get team section
$tenant = Tenant::where('slug', 'hyve-wellness')->first();
$page = Page::where('tenant_id', $tenant->id)->where('slug', 'home')->first();
$section = Section::where('page_id', $page->id)->where('component_type', 'team')->first();

if ($section) {
    $content = $section->content;
    
    // Get current images from content
    $currentImages = $content['images'] ?? [];
    
    // Create team_images block with current images
    $teamImagesBlock = [
        'id' => 'block_team_images_' . time(),
        'type' => 'team_images',
        'data' => [
            'primaryImage' => $currentImages['primary'] ?? '/images/9.png',
            'primaryAlt' => 'Medical consultation',
            'secondaryImage' => $currentImages['secondary'] ?? '/images/3-1-300x300.jpg',
            'secondaryAlt' => 'Our healthcare team',
            'badgeImage' => '/images/hyve-badge.png',
            'badgeAlt' => 'HYVE Wellness badge',
            'productImage' => '/images/glp1-product.png',
            'productAlt' => 'GLP-1 product vial',
        ],
        'settings' => ['visibility' => 'visible'],
    ];
    
    // Update blocks array - keep existing blocks and add team_images
    $blocks = $content['blocks'] ?? [];
    
    // Remove existing team_images blocks
    $blocks = array_filter($blocks, fn($b) => ($b['type'] ?? '') !== 'team_images');
    
    // Add the new block
    $blocks[] = $teamImagesBlock;
    
    $content['blocks'] = array_values($blocks);
    $section->content = $content;
    $section->save();
    
    echo "Team section updated with team_images block!\n";
    echo "  - Primary Image: " . $teamImagesBlock['data']['primaryImage'] . "\n";
    echo "  - Secondary Image: " . $teamImagesBlock['data']['secondaryImage'] . "\n";
} else {
    echo "Team section not found\n";
}

echo "\n=== Done! ===\n";
