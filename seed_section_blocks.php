<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;

echo "=== Seeding Section Blocks ===\n\n";

$sections = Section::all();

foreach ($sections as $section) {
    $content = $section->content ?? [];
    $existingBlocks = $content['blocks'] ?? [];
    
    // Skip if already has blocks
    if (count($existingBlocks) > 0) {
        echo "[{$section->component_type}] Already has " . count($existingBlocks) . " blocks - skipping\n";
        continue;
    }
    
    $newBlocks = [];
    $blockId = 1;
    
    switch ($section->component_type) {
        case 'hero':
            // Products carousel block
            if (isset($content['featured_products']) && count($content['featured_products']) > 0) {
                $newBlocks[] = [
                    'id' => 'block_' . $blockId++,
                    'type' => 'products_carousel',
                    'data' => [
                        'products' => $content['featured_products'],
                        'autoPlay' => true,
                        'interval' => 4000,
                        'showVialImage' => true,
                        'showProductCard' => true,
                    ],
                    'settings' => ['visibility' => 'visible'],
                ];
            }
            break;
            
        case 'services_grid':
            // Text block for description
            if (isset($content['description'])) {
                $newBlocks[] = [
                    'id' => 'block_' . $blockId++,
                    'type' => 'text',
                    'data' => [
                        'content' => $content['description'],
                        'alignment' => 'center',
                    ],
                    'settings' => ['visibility' => 'visible'],
                ];
            }
            break;
            
        case 'testimonials':
            // Slider block for testimonials
            $newBlocks[] = [
                'id' => 'block_' . $blockId++,
                'type' => 'slider',
                'data' => [
                    'items' => [],
                    'autoPlay' => true,
                    'interval' => 5000,
                    'showDots' => true,
                ],
                'settings' => ['visibility' => 'visible'],
            ];
            break;
            
        case 'faq':
            // Accordion block for FAQs
            $newBlocks[] = [
                'id' => 'block_' . $blockId++,
                'type' => 'accordion',
                'data' => [
                    'items' => [],
                    'allowMultiple' => false,
                ],
                'settings' => ['visibility' => 'visible'],
            ];
            break;
            
        case 'team':
            // Cards block for team members
            $newBlocks[] = [
                'id' => 'block_' . $blockId++,
                'type' => 'cards',
                'data' => [
                    'items' => [],
                    'columns' => 3,
                    'cardStyle' => 'elevated',
                ],
                'settings' => ['visibility' => 'visible'],
            ];
            break;
            
        case 'contact_form':
            // Form block
            $newBlocks[] = [
                'id' => 'block_' . $blockId++,
                'type' => 'form',
                'data' => [
                    'fields' => [],
                    'submitText' => 'Submit',
                    'successMessage' => 'Thank you for your message!',
                ],
                'settings' => ['visibility' => 'visible'],
            ];
            break;
    }
    
    if (count($newBlocks) > 0) {
        $content['blocks'] = $newBlocks;
        $section->content = $content;
        $section->save();
        echo "[{$section->component_type}] Added " . count($newBlocks) . " blocks\n";
    } else {
        echo "[{$section->component_type}] No blocks to add\n";
    }
}

echo "\n=== Done! ===\n";
