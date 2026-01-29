<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class TenantTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ========================================
        // Tenant 2 (Demo Clinic) - tenant1.local
        // ========================================
        
        // Header Menu
        Menu::updateOrCreate(
            ['tenant_id' => 2, 'location' => 'header'],
            [
                'name' => 'Demo Clinic Header',
                'items' => [
                    ['label' => 'Home', 'title' => 'Home', 'url' => '/', 'order' => 0, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Services', 'title' => 'Our Services', 'url' => '/services', 'order' => 1, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'About', 'title' => 'About Us', 'url' => '/about', 'order' => 2, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Contact', 'title' => 'Contact Us', 'url' => '/contact', 'order' => 3, 'is_active' => true, 'target' => '_self', 'children' => []],
                ],
                'is_active' => true,
            ]
        );

        // Footer Menu
        Menu::updateOrCreate(
            ['tenant_id' => 2, 'location' => 'footer'],
            [
                'name' => 'Demo Clinic Footer',
                'items' => [
                    ['label' => 'Privacy Policy', 'title' => 'Privacy', 'url' => '/privacy', 'order' => 0, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Terms', 'title' => 'Terms of Service', 'url' => '/terms', 'order' => 1, 'is_active' => true, 'target' => '_self', 'children' => []],
                ],
                'is_active' => true,
            ]
        );

        // Settings for Tenant 2
        Setting::updateOrCreate(
            ['tenant_id' => 2, 'key' => 'site_name'],
            ['value' => 'Demo Clinic', 'group' => 'general']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 2, 'key' => 'site_tagline'],
            ['value' => 'Your Health, Our Priority', 'group' => 'general']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 2, 'key' => 'contact_email'],
            ['value' => 'info@democlinic.com', 'group' => 'contact']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 2, 'key' => 'contact_phone'],
            ['value' => '+1 (555) 123-4567', 'group' => 'contact']
        );

        // ========================================
        // Tenant 3 (Test Wellness) - tenant2.local
        // ========================================
        
        // Header Menu
        Menu::updateOrCreate(
            ['tenant_id' => 3, 'location' => 'header'],
            [
                'name' => 'Test Wellness Header',
                'items' => [
                    ['label' => 'Home', 'title' => 'Home', 'url' => '/', 'order' => 0, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Treatments', 'title' => 'Our Treatments', 'url' => '/treatments', 'order' => 1, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'About', 'title' => 'About', 'url' => '/about', 'order' => 2, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Book Now', 'title' => 'Book Appointment', 'url' => '/booking', 'order' => 3, 'is_active' => true, 'target' => '_self', 'children' => []],
                ],
                'is_active' => true,
            ]
        );

        // Footer Menu
        Menu::updateOrCreate(
            ['tenant_id' => 3, 'location' => 'footer'],
            [
                'name' => 'Test Wellness Footer',
                'items' => [
                    ['label' => 'FAQ', 'title' => 'FAQ', 'url' => '/faq', 'order' => 0, 'is_active' => true, 'target' => '_self', 'children' => []],
                    ['label' => 'Privacy', 'title' => 'Privacy', 'url' => '/privacy', 'order' => 1, 'is_active' => true, 'target' => '_self', 'children' => []],
                ],
                'is_active' => true,
            ]
        );

        // Settings for Tenant 3
        Setting::updateOrCreate(
            ['tenant_id' => 3, 'key' => 'site_name'],
            ['value' => 'Test Wellness Center', 'group' => 'general']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 3, 'key' => 'site_tagline'],
            ['value' => 'Wellness for Everyone', 'group' => 'general']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 3, 'key' => 'contact_email'],
            ['value' => 'hello@testwellness.com', 'group' => 'contact']
        );
        Setting::updateOrCreate(
            ['tenant_id' => 3, 'key' => 'contact_phone'],
            ['value' => '+1 (555) 987-6543', 'group' => 'contact']
        );

        $this->command->info('Test data seeded for Tenant 2 (Demo Clinic) and Tenant 3 (Test Wellness)!');
    }
}
