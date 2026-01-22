<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        // Main Navigation Menu (Header)
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'header'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Main Navigation',
                'location' => 'header',
                'items' => [
                    ['title' => 'About', 'url' => '/about', 'target' => '_self', 'order' => 1],
                    [
                        'title' => 'Services',
                        'url' => '/services',
                        'target' => '_self',
                        'order' => 2,
                        'children' => [
                            ['title' => 'Weight Loss', 'url' => '/services?category=weight-loss', 'image' => '/images/weight-20loss-20besst.png'],
                            ['title' => 'Sexual Health', 'url' => '/services?category=sexual-health', 'image' => '/images/3-1-1-300x300.jpg'],
                            ['title' => 'Longevity', 'url' => '/services?category=longevity', 'image' => '/images/dad-20and-20son.png'],
                            ['title' => 'Hair', 'url' => '/services?category=hair', 'image' => '/images/6-1-300x300.jpg'],
                            ['title' => 'Skin', 'url' => '/services?category=skin', 'image' => '/images/man-201.png'],
                            ['title' => 'Brain & Mood', 'url' => '/services?category=brain-and-mood', 'image' => '/images/10-1-300x300.jpg'],
                            ['title' => 'Hormones', 'url' => '/services?category=hormones', 'image' => '/images/4-1-1-300x300.jpg'],
                        ],
                    ],
                    [
                        'title' => 'Partners',
                        'url' => '#',
                        'target' => '_self',
                        'order' => 3,
                        'children' => [
                            ['title' => 'Partner Login', 'url' => '/partners/login'],
                            ['title' => 'Become a Partner', 'url' => '/partners/signup'],
                        ],
                    ],
                    ['title' => 'Contact', 'url' => '/contact', 'target' => '_self', 'order' => 4],
                ],
                'is_active' => true,
            ]
        );

        // Footer Services Menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-services'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer Services',
                'location' => 'footer-services',
                'items' => [
                    ['title' => 'Weight Loss', 'url' => '/services?category=weight-loss', 'order' => 1],
                    ['title' => 'Sexual Health', 'url' => '/services?category=sexual-health', 'order' => 2],
                    ['title' => 'Longevity', 'url' => '/services?category=longevity', 'order' => 3],
                    ['title' => 'Hair', 'url' => '/services?category=hair', 'order' => 4],
                    ['title' => 'Skin', 'url' => '/services?category=skin', 'order' => 5],
                    ['title' => 'Mood', 'url' => '/services?category=brain-and-mood', 'order' => 6],
                    ['title' => 'Hormones', 'url' => '/services?category=hormones', 'order' => 7],
                ],
                'is_active' => true,
            ]
        );

        // Footer About Menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-about'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer About',
                'location' => 'footer-about',
                'items' => [
                    ['title' => 'Our Team', 'url' => '/about#team', 'order' => 1],
                    ['title' => 'Join Our Team', 'url' => '#careers', 'order' => 2],
                    ['title' => 'What To Expect', 'url' => '/about#what-to-expect', 'order' => 3],
                    ['title' => 'Contact Us', 'url' => '/contact', 'order' => 4],
                    ['title' => 'Patient Login', 'url' => 'https://partner.hyverx.com/', 'target' => '_blank', 'order' => 5],
                ],
                'is_active' => true,
            ]
        );

        // Footer VIP Menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-vip'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer VIP',
                'location' => 'footer-vip',
                'items' => [
                    ['title' => 'Become A Member', 'url' => '#', 'order' => 1],
                    ['title' => 'View Services', 'url' => '/services', 'order' => 2],
                ],
                'is_active' => true,
            ]
        );

        // Footer Legal/Policy Menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'footer-legal'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Footer Legal',
                'location' => 'footer-legal',
                'items' => [
                    ['title' => 'Privacy Policy', 'url' => '/privacy-policy', 'order' => 1],
                    ['title' => 'Website Terms & Conditions', 'url' => '#terms-conditions', 'order' => 2],
                    ['title' => 'Disclaimer of Liability', 'url' => '#disclaimer', 'order' => 3],
                    ['title' => 'Telehealth Consent', 'url' => '#telehealth-consent', 'order' => 4],
                    ['title' => 'Payment Plan Terms', 'url' => '#payment-terms', 'order' => 5],
                    ['title' => 'Partner Income Disclaimer', 'url' => '#partner-disclaimer', 'order' => 6],
                ],
                'is_active' => true,
            ]
        );

        // Social Links Menu
        Menu::updateOrCreate(
            ['tenant_id' => $tenantId, 'location' => 'social'],
            [
                'tenant_id' => $tenantId,
                'name' => 'Social Links',
                'location' => 'social',
                'items' => [
                    ['title' => 'Instagram', 'url' => 'https://instagram.com/hyverx', 'icon' => 'instagram', 'order' => 1],
                    ['title' => 'Facebook', 'url' => 'https://facebook.com/hyverx', 'icon' => 'facebook', 'order' => 2],
                    ['title' => 'Twitter', 'url' => 'https://twitter.com/hyverx', 'icon' => 'twitter', 'order' => 3],
                ],
                'is_active' => true,
            ]
        );
    }
}
