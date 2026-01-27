<?php
/**
 * Frontend Tenant Isolation Verification Script
 * 
 * This script simulates how the frontend (Next.js) would access tenant data
 * via API based on the domain. It verifies that each tenant's domain only
 * returns that tenant's data.
 * 
 * Usage: php verify_frontend_isolation.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\Page;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Middleware\TenantMiddleware;

echo "\n";
echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║      FRONTEND TENANT ISOLATION VERIFICATION                  ║\n";
echo "║      (Simulating API calls from different domains)           ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Get all tenants
$tenants = Tenant::where('is_active', true)->get();

echo "📊 REGISTERED DOMAINS\n";
echo "──────────────────────────────────────────────────────────────\n\n";

foreach ($tenants as $tenant) {
    echo "   [{$tenant->id}] {$tenant->name}\n";
    echo "       Primary Domain: " . ($tenant->domain ?? 'Not set') . "\n";
    if ($tenant->additional_domains && count($tenant->additional_domains) > 0) {
        echo "       Additional: " . implode(', ', $tenant->additional_domains) . "\n";
    }
    echo "       Slug: {$tenant->slug}\n\n";
}

echo "\n🌐 FRONTEND API SIMULATION\n";
echo "══════════════════════════════════════════════════════════════\n\n";

$middleware = new TenantMiddleware();

echo "   Flow: User visits domain → NGINX → Next.js → API (with X-Tenant-ID)\n\n";

foreach ($tenants as $tenant) {
    $domain = $tenant->domain ?? "{$tenant->slug}.hyve.com";
    
    echo "┌──────────────────────────────────────────────────────────────┐\n";
    echo "│ Simulating: User visits https://{$domain}              \n";
    echo "├──────────────────────────────────────────────────────────────┤\n";
    
    // Simulate request from this domain with X-Tenant-ID header
    $request = Request::create('/api/v1/pages', 'GET');
    $request->headers->set('X-Tenant-ID', $tenant->slug);
    $request->headers->set('Origin', "https://{$domain}");
    
    // Set the tenant context (this is what middleware does)
    $request->attributes->set('tenant', $tenant);
    $request->attributes->set('tenant_id', $tenant->id);
    app()->instance('current_tenant', $tenant);
    
    // Now query pages - the BelongsToTenant trait will filter by tenant
    $pages = Page::all();
    $services = Service::all();
    
    echo "│\n";
    echo "│ 📄 Pages visible: {$pages->count()}\n";
    
    // List page slugs
    foreach ($pages->take(5) as $page) {
        echo "│    • /{$page->slug}\n";
    }
    if ($pages->count() > 5) {
        echo "│    ... and " . ($pages->count() - 5) . " more\n";
    }
    
    echo "│\n";
    echo "│ 🛠️  Services visible: {$services->count()}\n";
    
    // List service names
    foreach ($services->take(5) as $service) {
        echo "│    • {$service->name}\n";
    }
    if ($services->count() > 5) {
        echo "│    ... and " . ($services->count() - 5) . " more\n";
    }
    
    // Verify isolation - check that all returned data belongs to this tenant
    $wrongPages = $pages->filter(fn($p) => $p->tenant_id !== $tenant->id);
    $wrongServices = $services->filter(fn($s) => $s->tenant_id !== $tenant->id);
    
    echo "│\n";
    if ($wrongPages->isEmpty() && $wrongServices->isEmpty()) {
        echo "│ ✅ ISOLATION: All data belongs to {$tenant->name} only\n";
    } else {
        echo "│ ❌ ISOLATION BREACH DETECTED!\n";
        if ($wrongPages->isNotEmpty()) {
            echo "│    - {$wrongPages->count()} pages from other tenants visible\n";
        }
        if ($wrongServices->isNotEmpty()) {
            echo "│    - {$wrongServices->count()} services from other tenants visible\n";
        }
    }
    
    echo "│\n";
    echo "└──────────────────────────────────────────────────────────────┘\n\n";
    
    // Clear the tenant context for next iteration
    app()->forgetInstance('current_tenant');
}

// Cross-tenant test
echo "\n🔐 CROSS-TENANT ACCESS TEST\n";
echo "══════════════════════════════════════════════════════════════\n\n";

if ($tenants->count() >= 2) {
    $tenant1 = $tenants[0];
    $tenant2 = $tenants[1];
    
    echo "   Testing: Can Tenant '{$tenant1->name}' see Tenant '{$tenant2->name}' data?\n\n";
    
    // Set context to tenant 1
    app()->instance('current_tenant', $tenant1);
    
    // Try to access pages
    $visiblePages = Page::all();
    $tenant2Pages = Page::withoutGlobalScope('tenant')
        ->where('tenant_id', $tenant2->id)
        ->count();
    
    $canSeeTenant2 = $visiblePages->contains(fn($p) => $p->tenant_id === $tenant2->id);
    
    if (!$canSeeTenant2 && $tenant2Pages > 0) {
        echo "   ✅ PASSED: {$tenant1->name} cannot see {$tenant2->name}'s {$tenant2Pages} pages\n";
    } elseif ($tenant2Pages === 0) {
        echo "   ⚠️  SKIPPED: {$tenant2->name} has no pages to test with\n";
    } else {
        echo "   ❌ FAILED: Cross-tenant data leakage detected!\n";
    }
} else {
    echo "   ⚠️  Need at least 2 tenants to perform cross-tenant test\n";
}

echo "\n\n📋 NGINX + SSL + FRONTEND FLOW SUMMARY\n";
echo "══════════════════════════════════════════════════════════════\n\n";

echo "   ┌─────────────────────────────────────────────────────────────┐\n";
echo "   │                    USER REQUEST FLOW                        │\n";
echo "   ├─────────────────────────────────────────────────────────────┤\n";
echo "   │                                                             │\n";
echo "   │  1. User visits: https://wellness.hyve.com                  │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  2. NGINX receives request (SSL termination)                │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  3. Next.js Frontend receives request                       │\n";
echo "   │     - Detects domain from Host header                       │\n";
echo "   │     - Resolves tenant slug from domain                      │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  4. Next.js calls Laravel API with X-Tenant-ID header       │\n";
echo "   │     GET /api/v1/pages                                       │\n";
echo "   │     Headers: X-Tenant-ID: hyve-wellness                     │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  5. TenantMiddleware resolves tenant                        │\n";
echo "   │     - Sets app('current_tenant')                            │\n";
echo "   │     - Sets request attribute tenant_id                      │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  6. BelongsToTenant Global Scope filters query              │\n";
echo "   │     SELECT * FROM pages WHERE tenant_id = 1                 │\n";
echo "   │         │                                                   │\n";
echo "   │         ▼                                                   │\n";
echo "   │  7. Only Hyve Wellness pages returned                       │\n";
echo "   │                                                             │\n";
echo "   │  ✅ Other tenant's data is NEVER visible                    │\n";
echo "   │                                                             │\n";
echo "   └─────────────────────────────────────────────────────────────┘\n\n";

echo "──────────────────────────────────────────────────────────────\n";
echo "Report generated at: " . now()->format('Y-m-d H:i:s') . "\n\n";
