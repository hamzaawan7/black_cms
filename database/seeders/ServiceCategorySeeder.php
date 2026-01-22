<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Base URL for CMS storage images.
     */
    protected string $storageBaseUrl = '/storage/media';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1; // Default tenant

        $categories = [
            [
                'tenant_id' => $tenantId,
                'name' => 'Weight Loss',
                'slug' => 'weight-loss',
                'description' => 'Achieve your ideal weight with our cutting-edge peptide therapies and personalized treatment plans.',
                'image' => $this->storageBaseUrl . '/services/weight-20loss-20besst.png',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Sexual Health',
                'slug' => 'sexual-health',
                'description' => 'Restore vitality and enhance intimacy with our advanced sexual wellness treatments.',
                'image' => $this->storageBaseUrl . '/services/sexual-20health-20best.png',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Longevity',
                'slug' => 'longevity',
                'description' => 'Unlock the science of aging gracefully with our longevity-focused peptide protocols.',
                'image' => $this->storageBaseUrl . '/services/longevity-201-20female.png',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Hair',
                'slug' => 'hair',
                'description' => 'Combat hair loss and promote healthy hair growth with our targeted therapies.',
                'image' => $this->storageBaseUrl . '/services/6-1-300x300.jpg',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Skin',
                'slug' => 'skin',
                'description' => 'Revitalize your skin with peptide treatments designed for anti-aging and rejuvenation.',
                'image' => $this->storageBaseUrl . '/services/man-201.png',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Brain & Mood',
                'slug' => 'brain-and-mood',
                'description' => 'Enhance cognitive function and emotional well-being with our neurological peptide therapies.',
                'image' => $this->storageBaseUrl . '/services/brain-20and-20mood.png',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Hormones',
                'slug' => 'hormones',
                'description' => 'Balance your hormones naturally with our comprehensive hormone optimization programs.',
                'image' => $this->storageBaseUrl . '/services/hormones-20male-201.png',
                'order' => 7,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::updateOrCreate(
                ['tenant_id' => $category['tenant_id'], 'slug' => $category['slug']],
                $category
            );
        }

        $this->command->info('Service categories seeded successfully.');
    }
}
