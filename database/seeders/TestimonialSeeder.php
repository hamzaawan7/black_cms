<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $testimonials = [
            [
                'tenant_id' => $tenantId,
                'author_name' => 'Barbara A.',
                'author_title' => 'Weight Loss Program',
                'author_image' => '/images/testimonial-1.jpg',
                'content' => 'The attention to detail and the friendly staff make every visit memorable. I\'ve lost 30 lbs in 3 months!',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'author_name' => 'Alyssa S.',
                'author_title' => 'Longevity Treatment',
                'author_image' => '/images/testimonial-2.jpg',
                'content' => 'I\'ve been a member for over a year, and it\'s the best investment I\'ve made for my health and energy.',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'author_name' => 'Hayley R.',
                'author_title' => 'Hormone Optimization',
                'author_image' => '/images/testimonial-3.jpg',
                'content' => 'A slice of paradise in the heart of the city. The telehealth experience is seamless and professional.',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'author_name' => 'Maria L.',
                'author_title' => 'Skin Rejuvenation',
                'author_image' => '/images/testimonial-4.jpg',
                'content' => 'The results exceeded all my expectations. I feel more confident and healthier than ever before.',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'author_name' => 'Jennifer K.',
                'author_title' => 'Brain & Mood Support',
                'author_image' => '/images/testimonial-5.jpg',
                'content' => 'Professional, knowledgeable, and truly caring staff. They changed my life for the better!',
                'rating' => 5,
                'is_featured' => true,
                'is_published' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(
                [
                    'tenant_id' => $testimonial['tenant_id'],
                    'author_name' => $testimonial['author_name'],
                ],
                $testimonial
            );
        }
    }
}
