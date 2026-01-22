<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TenantSeeder::class,
            MediaSeeder::class, // Must run before other seeders that reference images
            ServiceCategorySeeder::class,
            ServiceSeeder::class,
            FaqSeeder::class,
            TestimonialSeeder::class,
            TeamMemberSeeder::class,
            PageSeeder::class,
            SectionSeeder::class, // Must run after PageSeeder
            MenuSeeder::class,
            SettingSeeder::class,
        ]);
    }
}
