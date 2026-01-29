<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestTenantsSeeder extends Seeder
{
    /**
     * Create test tenants for local multi-tenant testing.
     */
    public function run(): void
    {
        $this->command->info('Creating test tenants for local multi-tenant testing...');

        // Tenant 1: Demo Clinic
        $tenant1 = Tenant::updateOrCreate(
            ['slug' => 'demo-clinic'],
            [
                'name' => 'Demo Clinic',
                'slug' => 'demo-clinic',
                'domain' => 'tenant1.local',
                'additional_domains' => ['tenant1.cms.local'],
                'is_active' => true,
                'settings' => [
                    'theme' => [
                        'primary_color' => '#4f46e5',
                        'secondary_color' => '#818cf8',
                    ],
                    'branding' => [
                        'logo' => '/images/logo.png',
                        'site_name' => 'Demo Clinic',
                    ],
                ],
            ]
        );

        // Create admin user for Tenant 1
        User::updateOrCreate(
            ['email' => 'admin@democlinic.com'],
            [
                'name' => 'Demo Admin',
                'email' => 'admin@democlinic.com',
                'password' => Hash::make('password'),
                'tenant_id' => $tenant1->id,
                'role' => 'tenant_admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅ Created Tenant 1: Demo Clinic (ID: {$tenant1->id})");
        $this->command->info("   Domain: tenant1.local");
        $this->command->info("   Admin: admin@democlinic.com / password");

        // Tenant 2: Test Wellness
        $tenant2 = Tenant::updateOrCreate(
            ['slug' => 'test-wellness'],
            [
                'name' => 'Test Wellness',
                'slug' => 'test-wellness',
                'domain' => 'tenant2.local',
                'additional_domains' => ['tenant2.cms.local'],
                'is_active' => true,
                'settings' => [
                    'theme' => [
                        'primary_color' => '#059669',
                        'secondary_color' => '#34d399',
                    ],
                    'branding' => [
                        'logo' => '/images/logo.png',
                        'site_name' => 'Test Wellness',
                    ],
                ],
            ]
        );

        // Create admin user for Tenant 2
        User::updateOrCreate(
            ['email' => 'admin@testwellness.com'],
            [
                'name' => 'Test Admin',
                'email' => 'admin@testwellness.com',
                'password' => Hash::make('password'),
                'tenant_id' => $tenant2->id,
                'role' => 'tenant_admin',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✅ Created Tenant 2: Test Wellness (ID: {$tenant2->id})");
        $this->command->info("   Domain: tenant2.local");
        $this->command->info("   Admin: admin@testwellness.com / password");

        // Update main tenant (Hyve Wellness) with local domain
        $mainTenant = Tenant::find(1);
        if ($mainTenant) {
            $mainTenant->update([
                'additional_domains' => ['hyve.local', 'cms.local', 'localhost'],
            ]);
            $this->command->info("✅ Updated Main Tenant: Hyve Wellness");
            $this->command->info("   Added local domains: hyve.local, cms.local");
        }

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('Test Tenants Created Successfully!');
        $this->command->info('========================================');
        $this->command->newLine();
        $this->command->info('Test URLs:');
        $this->command->info('  Main:    http://hyve.local (Frontend) | http://cms.local (CMS)');
        $this->command->info('  Tenant1: http://tenant1.local (Frontend) | http://tenant1.cms.local (CMS)');
        $this->command->info('  Tenant2: http://tenant2.local (Frontend) | http://tenant2.cms.local (CMS)');
    }
}
