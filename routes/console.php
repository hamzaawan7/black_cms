<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled Publishing: Run every minute to check for content ready to publish
Schedule::command('content:publish-scheduled')
    ->everyMinute()
    ->withoutOverlapping()
    ->runInBackground();

// ================================================
// VPS/NGINX Multi-Tenant Automation
// ================================================

// Auto-verify DNS for pending tenants every 5 minutes
// When DNS is verified, auto-generate SSL certificate
Schedule::command('tenant:verify --pending --auto-ssl')
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/tenant-verify.log'));

// Renew SSL certificates (Let's Encrypt auto-renewal check)
// Runs weekly - certbot handles renewal if needed
Schedule::command('ssl:renew')
    ->weekly()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/ssl-renew.log'));
