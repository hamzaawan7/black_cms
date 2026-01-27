<?php
/**
 * Create Test Tenant and Data for Isolation Testing
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\User;
use App\Models\Page;
use App\Models\Section;

echo "\n🔧 Creating Test Tenant for Isolation Testing...\n\n";

// Create second tenant
$tenant2 = Tenant::firstOrCreate(
    ['slug' => 'demo-clinic'],
    [
        'name' => 'Demo Clinic',
        'domain' => 'demo.hyve.com',
        'is_active' => true,
        'settings' => json_encode(['theme' => 'default']),
    ]
);
echo "✓ Tenant: {$tenant2->name} (ID: {$tenant2->id})\n";

// Create tenant_admin for tenant 2
$user2 = User::withoutGlobalScope('tenant')->firstOrCreate(
    ['email' => 'demo@hyve.com'],
    [
        'name' => 'Demo Admin',
        'password' => bcrypt('password123'),
        'role' => 'tenant_admin',
        'tenant_id' => $tenant2->id,
        'is_active' => true,
    ]
);
echo "✓ User: {$user2->email} (tenant_id: {$user2->tenant_id})\n";

// Create test page for tenant 2 - bypass global scope
$page = Page::withoutGlobalScope('tenant')->firstOrCreate(
    ['slug' => 'demo-home', 'tenant_id' => $tenant2->id],
    [
        'title' => 'Demo Home',
        'is_published' => true,
        'meta_title' => 'Demo Clinic Home',
        'meta_description' => 'Welcome to Demo Clinic',
    ]
);
echo "✓ Page: {$page->title} (tenant_id: {$page->tenant_id})\n";

// Create a section for this page
$section = Section::withoutGlobalScope('tenant')->firstOrCreate(
    ['page_id' => $page->id, 'type' => 'hero', 'tenant_id' => $tenant2->id],
    [
        'component_type' => 'hero',
        'order' => 1,
        'is_visible' => true,
        'content' => [
            'blocks' => [
                ['type' => 'heading', 'content' => 'Welcome to Demo Clinic'],
                ['type' => 'text', 'content' => 'This is tenant 2 content'],
            ]
        ],
    ]
);
echo "✓ Section: {$section->type} (tenant_id: {$section->tenant_id})\n";

echo "\n✅ Test data created successfully!\n";
echo "\nLogin credentials for Demo Clinic:\n";
echo "   Email: demo@hyve.com\n";
echo "   Password: password123\n\n";
