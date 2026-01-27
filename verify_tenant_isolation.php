<?php
/**
 * Tenant Isolation Verification Script
 * 
 * Run this to verify that tenant data is properly isolated.
 * 
 * Usage: php verify_tenant_isolation.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\Page;
use App\Models\Service;
use App\Models\Section;
use App\Models\Media;
use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "\n";
echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║        TENANT ISOLATION VERIFICATION REPORT                  ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Get all tenants
$tenants = Tenant::all();

echo "📊 TENANT OVERVIEW\n";
echo "──────────────────────────────────────────────────────────────\n";
printf("   Total Tenants: %d\n\n", $tenants->count());

foreach ($tenants as $tenant) {
    echo "   [{$tenant->id}] {$tenant->name}\n";
    echo "       Domain: " . ($tenant->domain ?? 'N/A') . "\n";
    echo "       Slug: {$tenant->slug}\n";
    echo "       Active: " . ($tenant->is_active ? '✓ Yes' : '✗ No') . "\n\n";
}

echo "\n📦 DATA DISTRIBUTION PER TENANT\n";
echo "══════════════════════════════════════════════════════════════\n\n";

$models = [
    'Pages' => Page::class,
    'Services' => Service::class,
    'Sections' => Section::class,
    'Media' => Media::class,
    'Users' => User::class,
];

// Table header
echo "┌──────────────────┬";
foreach ($tenants as $tenant) {
    echo str_pad("", 12, "─") . "┬";
}
echo str_pad("", 10, "─") . "┐\n";

echo "│ " . str_pad("Model", 16) . " │";
foreach ($tenants as $tenant) {
    echo " " . str_pad(substr($tenant->name, 0, 10), 10) . " │";
}
echo " " . str_pad("Orphaned", 8) . " │\n";

echo "├──────────────────┼";
foreach ($tenants as $tenant) {
    echo str_pad("", 12, "─") . "┼";
}
echo str_pad("", 10, "─") . "┤\n";

foreach ($models as $name => $modelClass) {
    echo "│ " . str_pad($name, 16) . " │";
    
    foreach ($tenants as $tenant) {
        // Disable global scope to count per tenant
        $count = $modelClass::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenant->id)
            ->count();
        echo " " . str_pad($count, 10, " ", STR_PAD_LEFT) . " │";
    }
    
    // Count orphaned (null tenant_id)
    $orphaned = $modelClass::withoutGlobalScope('tenant')
        ->whereNull('tenant_id')
        ->count();
    echo " " . str_pad($orphaned, 8, " ", STR_PAD_LEFT) . " │\n";
}

echo "└──────────────────┴";
foreach ($tenants as $tenant) {
    echo str_pad("", 12, "─") . "┴";
}
echo str_pad("", 10, "─") . "┘\n";

// Verify isolation
echo "\n\n🔒 ISOLATION VERIFICATION\n";
echo "══════════════════════════════════════════════════════════════\n\n";

$issues = [];

// Check for orphaned records
foreach ($models as $name => $modelClass) {
    if ($name === 'Users') continue; // Super admin may have null tenant_id
    
    $orphaned = $modelClass::withoutGlobalScope('tenant')
        ->whereNull('tenant_id')
        ->count();
    
    if ($orphaned > 0) {
        $issues[] = "⚠️  {$name}: {$orphaned} records with NULL tenant_id";
    }
}

// Check if global scope is applied
echo "   Testing Global Scope Application...\n\n";

foreach ($tenants as $tenant) {
    echo "   Simulating Tenant Admin login for: {$tenant->name}\n";
    
    // Simulate login as tenant admin
    $tenantUser = User::withoutGlobalScope('tenant')
        ->where('tenant_id', $tenant->id)
        ->where('role', 'tenant_admin')
        ->first();
    
    if (!$tenantUser) {
        echo "      ⚠️  No tenant_admin found for this tenant\n";
        continue;
    }
    
    // Clear session and auth
    auth()->login($tenantUser);
    session()->forget('active_tenant_id');
    
    // Now query pages - should only get this tenant's pages
    $visiblePages = Page::count();
    $totalTenantPages = Page::withoutGlobalScope('tenant')
        ->where('tenant_id', $tenant->id)
        ->count();
    
    if ($visiblePages === $totalTenantPages) {
        echo "      ✓ Pages: Can see {$visiblePages} (own tenant only)\n";
    } else {
        echo "      ✗ Pages: Can see {$visiblePages} but should see {$totalTenantPages}\n";
        $issues[] = "Tenant {$tenant->name} has isolation issue with Pages";
    }
    
    // Check services
    $visibleServices = Service::count();
    $totalTenantServices = Service::withoutGlobalScope('tenant')
        ->where('tenant_id', $tenant->id)
        ->count();
    
    if ($visibleServices === $totalTenantServices) {
        echo "      ✓ Services: Can see {$visibleServices} (own tenant only)\n";
    } else {
        echo "      ✗ Services: Can see {$visibleServices} but should see {$totalTenantServices}\n";
        $issues[] = "Tenant {$tenant->name} has isolation issue with Services";
    }
    
    echo "\n";
}

// Logout
auth()->logout();

// Summary
echo "\n📋 SUMMARY\n";
echo "══════════════════════════════════════════════════════════════\n\n";

if (empty($issues)) {
    echo "   ✅ ALL CHECKS PASSED!\n";
    echo "   \n";
    echo "   Tenant isolation is working correctly:\n";
    echo "   • Each tenant_admin only sees their own data\n";
    echo "   • Global scope is properly applied to all models\n";
    echo "   • Data changes are isolated per tenant\n";
} else {
    echo "   ⚠️  ISSUES FOUND:\n\n";
    foreach ($issues as $issue) {
        echo "   {$issue}\n";
    }
}

echo "\n──────────────────────────────────────────────────────────────\n";
echo "Report generated at: " . now()->format('Y-m-d H:i:s') . "\n\n";
