<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Update order to match original design
$orderMap = [
    'Weight Loss' => 1,
    'Sexual Health' => 2,
    'Longevity' => 3,
    'Hair' => 4,
    'Skin' => 5,
    'Brain & Mood' => 6,
    'Hormones' => 7,
    'Peptide Therapies' => 8,
    'Hormone Optimization' => 9,
    'IV Therapies' => 10,
    'Weight Management' => 11,
];

foreach ($orderMap as $name => $order) {
    $updated = App\Models\ServiceCategory::where('name', $name)->update(['order' => $order]);
    echo "Updated order for {$name} to {$order}: {$updated} rows\n";
}

echo "\nDone! Verifying:\n";
$categories = App\Models\ServiceCategory::orderBy('order')->get(['name', 'image', 'order']);
foreach ($categories as $cat) {
    echo "{$cat->order}. {$cat->name}: {$cat->image}\n";
}
