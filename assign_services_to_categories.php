<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Category mapping based on original static data
$serviceToCategory = [
    // Weight Loss (id=5)
    'AOD 9604' => 5,
    'Semaglutide + B12' => 5,
    'Tirzepatide + B12' => 5,
    'MOTS-C' => 5,
    
    // Sexual Health (id=6)
    'PT-141' => 6,
    
    // Longevity (id=7)
    'NAD+' => 7,
    'Epithalon' => 7,
    'Glutathione' => 7,
    'Semax/Selank' => 7,
    
    // Hair (id=8)
    'Hair Restoration Treatments' => 8,
    'GHK-Cu Peptide' => 8,
    
    // Skin (id=9)
    'BPC-157' => 9,
    'Tretinoin' => 9,
    
    // Brain & Mood (id=10)
    'Semax + Selank' => 10,
    
    // Hormones (id=11)
    'CJC-1295 + Ipamorelin' => 11,
    'Sermorelin' => 11,
    'Testosterone Cypionate' => 11,
];

// Mark popular services
$popularServices = ['Semaglutide + B12'];

echo "Assigning services to categories...\n";

foreach ($serviceToCategory as $name => $categoryId) {
    $updated = App\Models\Service::where('name', $name)->update(['category_id' => $categoryId]);
    echo "Assigned '{$name}' to category {$categoryId}: {$updated} rows\n";
}

echo "\nMarking popular services...\n";
foreach ($popularServices as $name) {
    $updated = App\Models\Service::where('name', $name)->update(['is_popular' => true]);
    echo "Marked '{$name}' as popular: {$updated} rows\n";
}

echo "\nDone! Verifying by category:\n";
$categories = App\Models\ServiceCategory::with('services')->orderBy('order')->get();
foreach ($categories as $cat) {
    echo "\n{$cat->name} (id={$cat->id}):\n";
    foreach ($cat->services as $service) {
        $popular = $service->is_popular ? ' [POPULAR]' : '';
        echo "  - {$service->name}{$popular}\n";
    }
}
