<?php

namespace App\Console\Commands;

use App\Models\Page;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PublishScheduledContent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'content:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish content that is scheduled for publishing';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = now();
        $publishedPages = 0;
        $publishedServices = 0;

        // Publish scheduled pages
        $pages = Page::where('publish_status', 'scheduled')
            ->where('scheduled_at', '<=', $now)
            ->get();

        foreach ($pages as $page) {
            $page->update([
                'is_published' => true,
                'published_at' => $now,
                'publish_status' => 'published',
                'scheduled_at' => null,
            ]);
            $publishedPages++;

            Log::info("Published scheduled page: {$page->title} (ID: {$page->id})");
        }

        // Publish scheduled services
        $services = Service::where('publish_status', 'scheduled')
            ->where('scheduled_at', '<=', $now)
            ->get();

        foreach ($services as $service) {
            $service->update([
                'is_published' => true,
                'publish_status' => 'published',
                'scheduled_at' => null,
            ]);
            $publishedServices++;

            Log::info("Published scheduled service: {$service->name} (ID: {$service->id})");
        }

        $this->info("Published {$publishedPages} page(s) and {$publishedServices} service(s).");

        return Command::SUCCESS;
    }
}
