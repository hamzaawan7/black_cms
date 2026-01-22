<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Section;
use App\Models\Tenant;
use App\Models\Page;
use App\Models\Testimonial;

echo "=== Seeding Testimonials Carousel Block ===\n\n";

// Get testimonials section
$tenant = Tenant::where('slug', 'hyve-wellness')->first();
$page = Page::where('tenant_id', $tenant->id)->where('slug', 'home')->first();
$section = Section::where('page_id', $page->id)->where('component_type', 'testimonials')->first();

if ($section) {
    $content = $section->content;
    
    // Get testimonials from database if exists, otherwise use defaults
    $dbTestimonials = collect([]);
    try {
        $dbTestimonials = Testimonial::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    } catch (\Exception $e) {
        echo "Note: Testimonials table not found, using defaults.\n";
        $dbTestimonials = collect([]);
    }
    
    // Default testimonials if none in database
    $defaultTestimonials = [
        [
            'name' => 'Barbara A.',
            'role' => 'Weight Loss Program',
            'image' => '/images/testimonial-1.jpg',
            'quote' => "The attention to detail and the friendly staff make every visit memorable. I've lost 30 lbs in 3 months!",
            'rating' => 5,
        ],
        [
            'name' => 'Alyssa S.',
            'role' => 'Longevity Treatment',
            'image' => '/images/testimonial-2.jpg',
            'quote' => "I've been a member for over a year, and it's the best investment I've made for my health and energy.",
            'rating' => 5,
        ],
        [
            'name' => 'Hayley R.',
            'role' => 'Hormone Optimization',
            'image' => '/images/testimonial-3.jpg',
            'quote' => 'A slice of paradise in the heart of the city. The telehealth experience is seamless and professional.',
            'rating' => 5,
        ],
        [
            'name' => 'Maria L.',
            'role' => 'Skin Rejuvenation',
            'image' => '/images/testimonial-4.jpg',
            'quote' => 'The results exceeded all my expectations. I feel more confident and healthier than ever before.',
            'rating' => 5,
        ],
        [
            'name' => 'Jennifer K.',
            'role' => 'Brain & Mood Support',
            'image' => '/images/testimonial-5.jpg',
            'quote' => 'Professional, knowledgeable, and truly caring staff. They changed my life for the better!',
            'rating' => 5,
        ],
    ];
    
    // Use database testimonials if available, otherwise defaults
    $testimonialData = $dbTestimonials->count() > 0 
        ? $dbTestimonials->map(function($t) {
            return [
                'name' => $t->name,
                'role' => $t->role ?? $t->title ?? '',
                'image' => $t->image ?? '/images/testimonial-default.jpg',
                'quote' => $t->quote ?? $t->content ?? '',
                'rating' => $t->rating ?? 5,
            ];
        })->toArray()
        : $defaultTestimonials;
    
    // Create testimonials_carousel block
    $testimonialsBlock = [
        'id' => 'block_testimonials_' . time(),
        'type' => 'testimonials_carousel',
        'data' => [
            'testimonials' => $testimonialData,
            'autoPlay' => true,
            'interval' => 5000,
            'showDots' => true,
            'showRating' => true,
        ],
        'settings' => ['visibility' => 'visible'],
    ];
    
    // Update blocks array
    $blocks = $content['blocks'] ?? [];
    
    // Remove existing testimonials_carousel blocks
    $blocks = array_filter($blocks, fn($b) => ($b['type'] ?? '') !== 'testimonials_carousel');
    
    // Add the new block
    $blocks[] = $testimonialsBlock;
    
    $content['blocks'] = array_values($blocks);
    $section->content = $content;
    $section->save();
    
    echo "Testimonials section updated with " . count($testimonialData) . " testimonials!\n";
    foreach ($testimonialData as $t) {
        echo "  - {$t['name']}: \"{$t['role']}\"\n";
    }
} else {
    echo "Testimonials section not found\n";
}

echo "\n=== Done! ===\n";
