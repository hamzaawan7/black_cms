<?php

namespace Database\Seeders;

use App\Models\Media;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaSeeder extends Seeder
{
    /**
     * The source images directory from the frontend template.
     */
    protected string $sourceDir = '';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;
        
        // Source directory - from the frontend project
        $this->sourceDir = base_path('../black_hyverx/public/images');
        
        // Ensure the storage directory exists
        Storage::disk('public')->makeDirectory('media');
        Storage::disk('public')->makeDirectory('media/products');
        Storage::disk('public')->makeDirectory('media/team');
        Storage::disk('public')->makeDirectory('media/services');
        Storage::disk('public')->makeDirectory('media/logos');
        Storage::disk('public')->makeDirectory('media/pages');

        // Product/Vial Images
        $productImages = [
            ['file' => '1.png', 'alt' => 'Product vial 1', 'folder' => 'products'],
            ['file' => '2.png', 'alt' => 'AOD 9604 vial', 'folder' => 'products'],
            ['file' => '3.png', 'alt' => 'Sermorelin vial', 'folder' => 'products'],
            ['file' => '4.png', 'alt' => 'Product vial 4', 'folder' => 'products'],
            ['file' => '5.png', 'alt' => 'Semaglutide + B12 vial', 'folder' => 'products'],
            ['file' => '6.png', 'alt' => 'Product vial 6', 'folder' => 'products'],
            ['file' => '7.png', 'alt' => 'GHK-Cu Peptide vial', 'folder' => 'products'],
            ['file' => '8.png', 'alt' => 'Product vial 8', 'folder' => 'products'],
            ['file' => '9.png', 'alt' => 'NAD+ vial', 'folder' => 'products'],
            ['file' => '10.png', 'alt' => 'PT-141 vial', 'folder' => 'products'],
            ['file' => '11.png', 'alt' => 'Product vial 11', 'folder' => 'products'],
            ['file' => '12.png', 'alt' => 'Product vial 12', 'folder' => 'products'],
            ['file' => '13.png', 'alt' => 'Product vial 13', 'folder' => 'products'],
            ['file' => '14.png', 'alt' => 'Product vial 14', 'folder' => 'products'],
            ['file' => '15.png', 'alt' => 'Product vial 15', 'folder' => 'products'],
            ['file' => '16.png', 'alt' => 'Tirzepatide + B12 vial', 'folder' => 'products'],
            ['file' => '17.png', 'alt' => 'Product vial 17', 'folder' => 'products'],
            ['file' => '18.png', 'alt' => 'Product vial 18', 'folder' => 'products'],
            ['file' => '19.png', 'alt' => 'Product vial 19', 'folder' => 'products'],
        ];

        // Team/Headshot Images
        $teamImages = [
            ['file' => 'colton-20headshot.png', 'alt' => 'Colton - Team Member', 'folder' => 'team'],
            ['file' => 'kris-20headshot.png', 'alt' => 'Kris - Team Member', 'folder' => 'team'],
            ['file' => 'tj-20headshot.jpeg', 'alt' => 'TJ - Team Member', 'folder' => 'team'],
        ];

        // Service Category Images
        $serviceImages = [
            ['file' => 'weight-20loss-20besst.png', 'alt' => 'Weight Loss Category', 'folder' => 'services'],
            ['file' => 'sexual-20health-20best.png', 'alt' => 'Sexual Health Category', 'folder' => 'services'],
            ['file' => 'dad-20and-20son.png', 'alt' => 'Longevity Category', 'folder' => 'services'],
            ['file' => 'man-201.png', 'alt' => 'Skin Category', 'folder' => 'services'],
            ['file' => 'brain-20and-20mood.png', 'alt' => 'Brain & Mood Category', 'folder' => 'services'],
            ['file' => 'hormones-20male-201.png', 'alt' => 'Hormones Category', 'folder' => 'services'],
            ['file' => 'longevity-201-20female.png', 'alt' => 'Longevity Female', 'folder' => 'services'],
            ['file' => '6-1-300x300.jpg', 'alt' => 'Hair Category', 'folder' => 'services'],
            ['file' => '10-1-300x300.jpg', 'alt' => 'Brain & Mood Lifestyle', 'folder' => 'services'],
            ['file' => '3-1-1-300x300.jpg', 'alt' => 'Sexual Health Lifestyle', 'folder' => 'services'],
            ['file' => '3-1-300x300.jpg', 'alt' => 'Team lifestyle photo', 'folder' => 'services'],
            ['file' => '4-1-1-300x300.jpg', 'alt' => 'Service lifestyle photo', 'folder' => 'services'],
            ['file' => '5-1-1-300x300.jpg', 'alt' => 'Service lifestyle photo 2', 'folder' => 'services'],
        ];

        // Logo Images
        $logoImages = [
            ['file' => 'hyve-20logo-20-20350-20x-20100-20-20charcoal.png', 'alt' => 'Hyve Logo Charcoal', 'folder' => 'logos'],
            ['file' => 'hyve-20logo-20-20350-20x-20100-20-20champagne-20gold.png', 'alt' => 'Hyve Logo Champagne Gold', 'folder' => 'logos'],
            ['file' => 'hyve-logo-white.png', 'alt' => 'Hyve Logo White', 'folder' => 'logos'],
            ['file' => 'hyve-logo-icon.png', 'alt' => 'Hyve Logo Icon', 'folder' => 'logos'],
        ];

        // Page/Section Images
        $pageImages = [
            ['file' => 'hyve-20wellness-20mockups.png', 'alt' => 'Hyve Wellness Mockups', 'folder' => 'pages'],
            ['file' => '2024-2007-20pam-20bree-20christina-20lifestyle-2010.jpg', 'alt' => 'Team Lifestyle Photo', 'folder' => 'pages'],
            ['file' => '8-1-1030x1030.jpg', 'alt' => 'About Page Hero', 'folder' => 'pages'],
            ['file' => 'chatgpt-20image-20dec-2015-2c-202025-2c-2003-46-19-20pm.png', 'alt' => 'Contact Section Image', 'folder' => 'pages'],
            ['file' => 'img-8699.jpg', 'alt' => 'Lifestyle Photo', 'folder' => 'pages'],
        ];

        // Merge all images
        $allImages = array_merge($productImages, $teamImages, $serviceImages, $logoImages, $pageImages);

        foreach ($allImages as $imageData) {
            $this->seedImage($tenantId, $imageData['file'], $imageData['alt'], $imageData['folder']);
        }

        $this->command->info('Media seeder completed. ' . count($allImages) . ' images processed.');
    }

    /**
     * Seed a single image.
     */
    protected function seedImage(int $tenantId, string $filename, string $altText, string $folder): void
    {
        $sourcePath = $this->sourceDir . '/' . $filename;
        
        if (!file_exists($sourcePath)) {
            $this->command->warn("Source file not found: {$filename}");
            return;
        }

        // Generate a clean filename
        $cleanFilename = Str::slug(pathinfo($filename, PATHINFO_FILENAME)) . '.' . pathinfo($filename, PATHINFO_EXTENSION);
        $storagePath = "media/{$folder}/{$cleanFilename}";

        // Copy file to storage
        $fileContents = file_get_contents($sourcePath);
        Storage::disk('public')->put($storagePath, $fileContents);

        // Get file info
        $mimeType = mime_content_type($sourcePath);
        $fileSize = filesize($sourcePath);

        // Create or update media record
        Media::updateOrCreate(
            [
                'tenant_id' => $tenantId,
                'filename' => $cleanFilename,
            ],
            [
                'original_filename' => $filename,
                'path' => $storagePath,
                'url' => '/storage/' . $storagePath,
                'disk' => 'public',
                'mime_type' => $mimeType,
                'size' => $fileSize,
                'alt_text' => $altText,
                'folder' => $folder,
            ]
        );

        $this->command->line("  Seeded: {$filename} -> {$storagePath}");
    }
}
