<?php

namespace Database\Seeders;

use App\Models\ComponentType;
use Illuminate\Database\Seeder;

class ComponentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $componentTypes = [
            [
                'name' => 'Hero Section',
                'slug' => 'hero',
                'description' => 'Full-width hero with background image and text',
                'icon' => 'layout-template',
                'is_system' => true,
                'order' => 1,
                'fields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true, 'placeholder' => 'Enter headline...'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false, 'placeholder' => 'Enter description...'],
                    ['name' => 'background_image', 'label' => 'Background Image', 'type' => 'media', 'required' => false],
                    ['name' => 'cta_text', 'label' => 'Button Text', 'type' => 'text', 'required' => false, 'placeholder' => 'Get Started'],
                    ['name' => 'cta_link', 'label' => 'Button Link', 'type' => 'url', 'required' => false, 'placeholder' => '/contact'],
                    ['name' => 'overlay_opacity', 'label' => 'Overlay Opacity', 'type' => 'number', 'required' => false, 'default' => 50, 'min' => 0, 'max' => 100],
                ],
            ],
            [
                'name' => 'Text Block',
                'slug' => 'text',
                'description' => 'Rich text content section',
                'icon' => 'type',
                'is_system' => true,
                'order' => 2,
                'fields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => false, 'placeholder' => 'Section title...'],
                    ['name' => 'content', 'label' => 'Content', 'type' => 'richtext', 'required' => true],
                    ['name' => 'alignment', 'label' => 'Text Alignment', 'type' => 'select', 'required' => false, 'options' => ['left' => 'Left', 'center' => 'Center', 'right' => 'Right'], 'default' => 'left'],
                ],
            ],
            [
                'name' => 'Services Grid',
                'slug' => 'services_grid',
                'description' => 'Grid display of services',
                'icon' => 'package',
                'is_system' => true,
                'order' => 3,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false, 'placeholder' => 'Our Services'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'columns', 'label' => 'Number of Columns', 'type' => 'select', 'required' => false, 'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns'], 'default' => '3'],
                    ['name' => 'show_popular', 'label' => 'Show Popular Only', 'type' => 'toggle', 'required' => false, 'default' => false],
                    ['name' => 'category_id', 'label' => 'Filter by Category', 'type' => 'select', 'required' => false, 'dynamic' => 'categories'],
                    ['name' => 'limit', 'label' => 'Max Items', 'type' => 'number', 'required' => false, 'default' => 6, 'min' => 1, 'max' => 24],
                ],
            ],
            [
                'name' => 'Testimonials',
                'slug' => 'testimonials',
                'description' => 'Customer testimonials carousel',
                'icon' => 'message-square-quote',
                'is_system' => true,
                'order' => 4,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false, 'placeholder' => 'What Our Clients Say'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'layout', 'label' => 'Layout', 'type' => 'select', 'required' => false, 'options' => ['carousel' => 'Carousel', 'grid' => 'Grid', 'masonry' => 'Masonry'], 'default' => 'carousel'],
                    ['name' => 'limit', 'label' => 'Max Testimonials', 'type' => 'number', 'required' => false, 'default' => 6],
                    ['name' => 'show_rating', 'label' => 'Show Star Rating', 'type' => 'toggle', 'required' => false, 'default' => true],
                ],
            ],
            [
                'name' => 'FAQ Section',
                'slug' => 'faq',
                'description' => 'Frequently asked questions accordion',
                'icon' => 'help-circle',
                'is_system' => true,
                'order' => 5,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false, 'placeholder' => 'Frequently Asked Questions'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'category', 'label' => 'Filter by Category', 'type' => 'text', 'required' => false],
                    ['name' => 'limit', 'label' => 'Max Questions', 'type' => 'number', 'required' => false, 'default' => 10],
                    ['name' => 'expand_first', 'label' => 'Expand First Item', 'type' => 'toggle', 'required' => false, 'default' => true],
                ],
            ],
            [
                'name' => 'Team Section',
                'slug' => 'team',
                'description' => 'Team members grid',
                'icon' => 'users',
                'is_system' => true,
                'order' => 6,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false, 'placeholder' => 'Meet Our Team'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'columns', 'label' => 'Number of Columns', 'type' => 'select', 'required' => false, 'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns'], 'default' => '3'],
                    ['name' => 'show_social', 'label' => 'Show Social Links', 'type' => 'toggle', 'required' => false, 'default' => true],
                    ['name' => 'limit', 'label' => 'Max Members', 'type' => 'number', 'required' => false, 'default' => 6],
                ],
            ],
            [
                'name' => 'Contact Section',
                'slug' => 'contact',
                'description' => 'Contact form and information',
                'icon' => 'phone',
                'is_system' => true,
                'order' => 7,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false, 'placeholder' => 'Get In Touch'],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'show_form', 'label' => 'Show Contact Form', 'type' => 'toggle', 'required' => false, 'default' => true],
                    ['name' => 'show_map', 'label' => 'Show Map', 'type' => 'toggle', 'required' => false, 'default' => false],
                    ['name' => 'show_info', 'label' => 'Show Contact Info', 'type' => 'toggle', 'required' => false, 'default' => true],
                    ['name' => 'form_endpoint', 'label' => 'Form Submission URL', 'type' => 'url', 'required' => false],
                ],
            ],
            [
                'name' => 'Call to Action',
                'slug' => 'cta',
                'description' => 'Call to action banner',
                'icon' => 'megaphone',
                'is_system' => true,
                'order' => 8,
                'fields' => [
                    ['name' => 'title', 'label' => 'Headline', 'type' => 'text', 'required' => true, 'placeholder' => 'Ready to get started?'],
                    ['name' => 'subtitle', 'label' => 'Description', 'type' => 'textarea', 'required' => false],
                    ['name' => 'button_text', 'label' => 'Button Text', 'type' => 'text', 'required' => true, 'placeholder' => 'Contact Us'],
                    ['name' => 'button_link', 'label' => 'Button Link', 'type' => 'url', 'required' => true, 'placeholder' => '/contact'],
                    ['name' => 'background_color', 'label' => 'Background Color', 'type' => 'color', 'required' => false, 'default' => '#c9a962'],
                    ['name' => 'background_image', 'label' => 'Background Image', 'type' => 'media', 'required' => false],
                ],
            ],
            [
                'name' => 'Image Gallery',
                'slug' => 'image_gallery',
                'description' => 'Image gallery grid',
                'icon' => 'images',
                'is_system' => true,
                'order' => 9,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false],
                    ['name' => 'columns', 'label' => 'Number of Columns', 'type' => 'select', 'required' => false, 'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns', '5' => '5 Columns'], 'default' => '4'],
                    ['name' => 'images', 'label' => 'Gallery Images', 'type' => 'repeater', 'required' => true, 'fields' => [
                        ['name' => 'image', 'label' => 'Image', 'type' => 'media'],
                        ['name' => 'caption', 'label' => 'Caption', 'type' => 'text'],
                    ]],
                    ['name' => 'lightbox', 'label' => 'Enable Lightbox', 'type' => 'toggle', 'required' => false, 'default' => true],
                ],
            ],
            [
                'name' => 'Custom HTML',
                'slug' => 'custom',
                'description' => 'Custom HTML/embed content',
                'icon' => 'code',
                'is_system' => true,
                'order' => 10,
                'fields' => [
                    ['name' => 'html', 'label' => 'HTML Content', 'type' => 'richtext', 'required' => true],
                    ['name' => 'container', 'label' => 'Use Container', 'type' => 'toggle', 'required' => false, 'default' => true],
                ],
            ],
            [
                'name' => 'Features Grid',
                'slug' => 'features',
                'description' => 'Feature highlights with icons',
                'icon' => 'sparkles',
                'is_system' => true,
                'order' => 11,
                'fields' => [
                    ['name' => 'title', 'label' => 'Section Title', 'type' => 'text', 'required' => false],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea', 'required' => false],
                    ['name' => 'columns', 'label' => 'Number of Columns', 'type' => 'select', 'required' => false, 'options' => ['2' => '2 Columns', '3' => '3 Columns', '4' => '4 Columns'], 'default' => '3'],
                    ['name' => 'features', 'label' => 'Features', 'type' => 'repeater', 'required' => true, 'fields' => [
                        ['name' => 'icon', 'label' => 'Icon', 'type' => 'text'],
                        ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                        ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
                    ]],
                ],
            ],
        ];

        foreach ($componentTypes as $type) {
            ComponentType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}
