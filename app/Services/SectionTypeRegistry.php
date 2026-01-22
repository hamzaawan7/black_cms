<?php

namespace App\Services;

/**
 * Section Type Registry
 * 
 * Centralized registry for all available section types.
 * Defines schemas, default content, and validation rules for each type.
 */
class SectionTypeRegistry
{
    /**
     * All registered section types with their configurations.
     */
    protected array $types = [];

    public function __construct()
    {
        $this->registerDefaultTypes();
    }

    /**
     * Register all default section types.
     */
    protected function registerDefaultTypes(): void
    {
        // Hero Section
        $this->register('hero', [
            'name' => 'Hero Section',
            'description' => 'Full-width hero banner with title, description, and CTA',
            'icon' => 'layout-template',
            'category' => 'headers',
            'schema' => [
                'pre_title' => ['type' => 'string', 'label' => 'Pre-title', 'required' => false],
                'title' => ['type' => 'string', 'label' => 'Title', 'required' => true],
                'title_highlight' => ['type' => 'string', 'label' => 'Highlighted Word', 'required' => false],
                'description' => ['type' => 'text', 'label' => 'Description', 'required' => false],
                'background_image' => ['type' => 'image', 'label' => 'Background Image', 'required' => false],
                'cta_primary' => [
                    'type' => 'object',
                    'label' => 'Primary CTA',
                    'fields' => [
                        'text' => ['type' => 'string', 'label' => 'Button Text'],
                        'url' => ['type' => 'string', 'label' => 'Button URL'],
                    ],
                ],
                'cta_secondary' => [
                    'type' => 'object',
                    'label' => 'Secondary CTA',
                    'fields' => [
                        'text' => ['type' => 'string', 'label' => 'Button Text'],
                        'url' => ['type' => 'string', 'label' => 'Button URL'],
                    ],
                ],
            ],
            'defaults' => [
                'pre_title' => 'Welcome',
                'title' => 'Your Title Here',
                'description' => 'Add your description text here.',
                'cta_primary' => ['text' => 'Get Started', 'url' => '/contact'],
            ],
        ]);

        // Services Grid
        $this->register('services_grid', [
            'name' => 'Services Grid',
            'description' => 'Grid display of service categories',
            'icon' => 'grid-3x3',
            'category' => 'content',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'description' => ['type' => 'text', 'label' => 'Section Description', 'required' => false],
                'show_categories' => ['type' => 'boolean', 'label' => 'Show Categories', 'default' => true],
                'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => [2, 3, 4], 'default' => 3],
            ],
            'defaults' => [
                'title' => 'Our Services',
                'show_categories' => true,
                'columns' => 3,
            ],
        ]);

        // Team Section
        $this->register('team', [
            'name' => 'Team Section',
            'description' => 'Display team members with photos and bios',
            'icon' => 'users',
            'category' => 'content',
            'schema' => [
                'pre_title' => ['type' => 'string', 'label' => 'Pre-title', 'required' => false],
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'title_highlight' => ['type' => 'string', 'label' => 'Highlighted Word', 'required' => false],
                'description' => ['type' => 'text', 'label' => 'Section Description', 'required' => false],
                'show_bio' => ['type' => 'boolean', 'label' => 'Show Bio', 'default' => true],
                'max_members' => ['type' => 'number', 'label' => 'Max Members to Show', 'default' => 6],
            ],
            'defaults' => [
                'pre_title' => 'Our Team',
                'title' => 'Meet Our Experts',
                'show_bio' => true,
                'max_members' => 6,
            ],
        ]);

        // Testimonials Section
        $this->register('testimonials', [
            'name' => 'Testimonials',
            'description' => 'Customer testimonials carousel or grid',
            'icon' => 'message-square-quote',
            'category' => 'social-proof',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'layout' => ['type' => 'select', 'label' => 'Layout', 'options' => ['carousel', 'grid'], 'default' => 'carousel'],
                'show_rating' => ['type' => 'boolean', 'label' => 'Show Rating', 'default' => true],
                'show_photo' => ['type' => 'boolean', 'label' => 'Show Photo', 'default' => true],
            ],
            'defaults' => [
                'title' => 'What Our Clients Say',
                'layout' => 'carousel',
                'show_rating' => true,
                'show_photo' => true,
            ],
        ]);

        // FAQ Section
        $this->register('faq', [
            'name' => 'FAQ Section',
            'description' => 'Frequently asked questions accordion',
            'icon' => 'help-circle',
            'category' => 'content',
            'schema' => [
                'pre_title' => ['type' => 'string', 'label' => 'Pre-title', 'required' => false],
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'title_highlight' => ['type' => 'string', 'label' => 'Highlighted Word', 'required' => false],
                'items' => [
                    'type' => 'array',
                    'label' => 'FAQ Items',
                    'item_schema' => [
                        'question' => ['type' => 'string', 'label' => 'Question', 'required' => true],
                        'answer' => ['type' => 'text', 'label' => 'Answer', 'required' => true],
                    ],
                ],
            ],
            'defaults' => [
                'pre_title' => 'FAQ',
                'title' => 'Frequently Asked Questions',
                'items' => [],
            ],
        ]);

        // Contact Section
        $this->register('contact', [
            'name' => 'Contact Section',
            'description' => 'Contact form with info',
            'icon' => 'mail',
            'category' => 'forms',
            'schema' => [
                'pre_title' => ['type' => 'string', 'label' => 'Pre-title', 'required' => false],
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'title_highlight' => ['type' => 'string', 'label' => 'Highlighted Word', 'required' => false],
                'description' => ['type' => 'text', 'label' => 'Description', 'required' => false],
                'show_form' => ['type' => 'boolean', 'label' => 'Show Contact Form', 'default' => true],
                'show_map' => ['type' => 'boolean', 'label' => 'Show Map', 'default' => false],
                'show_info' => ['type' => 'boolean', 'label' => 'Show Contact Info', 'default' => true],
            ],
            'defaults' => [
                'pre_title' => 'Contact',
                'title' => 'Get In Touch',
                'show_form' => true,
                'show_info' => true,
            ],
        ]);

        // CTA Section
        $this->register('cta', [
            'name' => 'Call to Action',
            'description' => 'Prominent call-to-action banner',
            'icon' => 'megaphone',
            'category' => 'conversion',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Title', 'required' => true],
                'description' => ['type' => 'text', 'label' => 'Description', 'required' => false],
                'button_text' => ['type' => 'string', 'label' => 'Button Text', 'required' => true],
                'button_url' => ['type' => 'string', 'label' => 'Button URL', 'required' => true],
                'background_color' => ['type' => 'color', 'label' => 'Background Color', 'default' => '#3d3d3d'],
            ],
            'defaults' => [
                'title' => 'Ready to Get Started?',
                'description' => 'Take the first step towards your wellness journey.',
                'button_text' => 'Contact Us',
                'button_url' => '/contact',
            ],
        ]);

        // Text Block
        $this->register('text_block', [
            'name' => 'Text Block',
            'description' => 'Rich text content block',
            'icon' => 'type',
            'category' => 'content',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Title', 'required' => false],
                'content' => ['type' => 'richtext', 'label' => 'Content', 'required' => true],
                'alignment' => ['type' => 'select', 'label' => 'Alignment', 'options' => ['left', 'center', 'right'], 'default' => 'left'],
            ],
            'defaults' => [
                'content' => '<p>Your content here...</p>',
                'alignment' => 'left',
            ],
        ]);

        // Image Gallery
        $this->register('gallery', [
            'name' => 'Image Gallery',
            'description' => 'Grid of images with lightbox',
            'icon' => 'images',
            'category' => 'media',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'images' => [
                    'type' => 'array',
                    'label' => 'Images',
                    'item_schema' => [
                        'url' => ['type' => 'image', 'label' => 'Image', 'required' => true],
                        'alt' => ['type' => 'string', 'label' => 'Alt Text', 'required' => false],
                        'caption' => ['type' => 'string', 'label' => 'Caption', 'required' => false],
                    ],
                ],
                'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => [2, 3, 4], 'default' => 3],
            ],
            'defaults' => [
                'images' => [],
                'columns' => 3,
            ],
        ]);

        // Stats/Numbers Section
        $this->register('stats', [
            'name' => 'Statistics',
            'description' => 'Display key numbers and statistics',
            'icon' => 'bar-chart-2',
            'category' => 'social-proof',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'items' => [
                    'type' => 'array',
                    'label' => 'Stats',
                    'item_schema' => [
                        'value' => ['type' => 'string', 'label' => 'Value', 'required' => true],
                        'label' => ['type' => 'string', 'label' => 'Label', 'required' => true],
                        'icon' => ['type' => 'string', 'label' => 'Icon', 'required' => false],
                    ],
                ],
            ],
            'defaults' => [
                'items' => [
                    ['value' => '1000+', 'label' => 'Happy Clients'],
                    ['value' => '50+', 'label' => 'Services'],
                    ['value' => '10+', 'label' => 'Years Experience'],
                ],
            ],
        ]);

        // Pricing Table
        $this->register('pricing', [
            'name' => 'Pricing Table',
            'description' => 'Display pricing plans',
            'icon' => 'credit-card',
            'category' => 'conversion',
            'schema' => [
                'title' => ['type' => 'string', 'label' => 'Section Title', 'required' => false],
                'plans' => [
                    'type' => 'array',
                    'label' => 'Pricing Plans',
                    'item_schema' => [
                        'name' => ['type' => 'string', 'label' => 'Plan Name', 'required' => true],
                        'price' => ['type' => 'string', 'label' => 'Price', 'required' => true],
                        'period' => ['type' => 'string', 'label' => 'Period', 'required' => false],
                        'features' => ['type' => 'array', 'label' => 'Features'],
                        'is_popular' => ['type' => 'boolean', 'label' => 'Popular Badge', 'default' => false],
                        'cta_text' => ['type' => 'string', 'label' => 'Button Text'],
                        'cta_url' => ['type' => 'string', 'label' => 'Button URL'],
                    ],
                ],
            ],
            'defaults' => [
                'title' => 'Choose Your Plan',
                'plans' => [],
            ],
        ]);

        // Newsletter Section
        $this->register('newsletter', [
            'name' => 'Newsletter Signup',
            'description' => 'Email subscription form with incentive',
            'icon' => 'mail',
            'category' => 'conversion',
            'schema' => [
                'pre_title' => ['type' => 'string', 'label' => 'Pre-title', 'required' => false],
                'title' => ['type' => 'string', 'label' => 'Title', 'required' => false],
                'description' => ['type' => 'text', 'label' => 'Description', 'required' => false],
                'placeholder' => ['type' => 'string', 'label' => 'Email Placeholder', 'default' => 'Enter your email address'],
                'button_text' => ['type' => 'string', 'label' => 'Button Text', 'default' => 'Subscribe'],
                'success_message' => ['type' => 'text', 'label' => 'Success Message'],
                'incentive_text' => ['type' => 'string', 'label' => 'Incentive Text (e.g., "Get 10% off")'],
                'variant' => ['type' => 'select', 'label' => 'Layout Variant', 'options' => ['default', 'compact', 'banner', 'card'], 'default' => 'default'],
            ],
            'defaults' => [
                'pre_title' => 'STAY UPDATED',
                'title' => 'Subscribe to Our Newsletter',
                'description' => 'Get the latest health tips, exclusive offers, and wellness insights.',
                'button_text' => 'Subscribe',
                'variant' => 'default',
            ],
        ]);
    }

    /**
     * Register a section type.
     */
    public function register(string $type, array $config): void
    {
        $this->types[$type] = array_merge([
            'name' => $type,
            'description' => '',
            'icon' => 'square',
            'category' => 'general',
            'schema' => [],
            'defaults' => [],
        ], $config);
    }

    /**
     * Check if a type is valid.
     */
    public function isValidType(string $type): bool
    {
        return isset($this->types[$type]);
    }

    /**
     * Get all registered type names.
     */
    public function getAllTypes(): array
    {
        return array_keys($this->types);
    }

    /**
     * Get all types with their full configuration.
     */
    public function getAllTypesWithSchema(): array
    {
        return $this->types;
    }

    /**
     * Get types grouped by category.
     */
    public function getTypesByCategory(): array
    {
        $grouped = [];
        
        foreach ($this->types as $type => $config) {
            $category = $config['category'] ?? 'general';
            if (!isset($grouped[$category])) {
                $grouped[$category] = [];
            }
            $grouped[$category][$type] = $config;
        }
        
        return $grouped;
    }

    /**
     * Get schema for a specific type.
     */
    public function getTypeSchema(string $type): ?array
    {
        return $this->types[$type] ?? null;
    }

    /**
     * Get default content for a type.
     */
    public function getDefaultContent(string $type): array
    {
        return $this->types[$type]['defaults'] ?? [];
    }

    /**
     * Validate content against a type's schema.
     */
    public function validateContent(string $type, array $content): array
    {
        $errors = [];
        $schema = $this->types[$type]['schema'] ?? [];

        foreach ($schema as $field => $rules) {
            if (($rules['required'] ?? false) && !isset($content[$field])) {
                $errors[$field] = "The {$field} field is required.";
            }
        }

        return $errors;
    }
}
