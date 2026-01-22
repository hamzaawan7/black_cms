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
