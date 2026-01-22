<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$tenant = App\Models\Tenant::where('slug', 'hyve-wellness')->first();
$page = App\Models\Page::where('tenant_id', $tenant->id)->where('slug', 'home')->first();
$section = App\Models\Section::where('page_id', $page->id)->where('component_type', 'services_grid')->first();

echo "Services Grid section found: " . ($section ? 'Yes' : 'No') . PHP_EOL;

if ($section) {
    $content = $section->content;
    $blocks = $content['blocks'] ?? [];
    echo "Blocks count: " . count($blocks) . PHP_EOL;
    
    foreach ($blocks as $block) {
        echo "Block type: " . $block['type'] . PHP_EOL;
        if ($block['type'] === 'services_carousel' && isset($block['data']['categories'])) {
            echo "Categories count: " . count($block['data']['categories']) . PHP_EOL;
            // Show first category structure
            $firstCat = $block['data']['categories'][0] ?? null;
            if ($firstCat) {
                echo "First category keys: " . implode(', ', array_keys($firstCat)) . PHP_EOL;
                echo "First category: " . json_encode($firstCat, JSON_PRETTY_PRINT) . PHP_EOL;
            }
        }
    }
}
