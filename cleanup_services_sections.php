<?php
/**
 * Cleanup Services Page Sections
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🧹 Cleaning up Services Page Sections...\n\n";

// Get Services page sections
$sections = DB::table('sections')
    ->where('page_id', 3)
    ->get(['id', 'component_type', 'order']);

echo "Current sections:\n";
foreach ($sections as $s) {
    echo "  - {$s->component_type} (id: {$s->id}, order: {$s->order})\n";
}

// Delete services_list section (old/unused)
$deleted = DB::table('sections')
    ->where('page_id', 3)
    ->where('component_type', 'services_list')
    ->delete();

echo "\n✓ Deleted services_list: {$deleted} row(s)\n";

// Update orders for remaining sections
DB::table('sections')->where('page_id', 3)->where('component_type', 'services_hero')->update(['order' => 1]);
DB::table('sections')->where('page_id', 3)->where('component_type', 'services_categories')->update(['order' => 2]);
DB::table('sections')->where('page_id', 3)->where('component_type', 'services_cta')->update(['order' => 3]);

echo "✓ Orders updated\n";

// Show final state
$final = DB::table('sections')
    ->where('page_id', 3)
    ->orderBy('order')
    ->get(['id', 'component_type', 'order']);

echo "\n✅ Final sections for Services page:\n";
foreach ($final as $s) {
    echo "  - {$s->component_type} (order: {$s->order}, id: {$s->id})\n";
}
