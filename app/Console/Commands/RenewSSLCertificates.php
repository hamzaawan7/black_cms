<?php

namespace App\Console\Commands;

use App\Services\SSLService;
use Illuminate\Console\Command;

class RenewSSLCertificates extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'ssl:renew';

    /**
     * The console command description.
     */
    protected $description = 'Renew SSL certificates using certbot';

    protected SSLService $sslService;

    public function __construct(SSLService $sslService)
    {
        parent::__construct();
        $this->sslService = $sslService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('===========================================');
        $this->info('  SSL Certificate Renewal');
        $this->info('===========================================');
        $this->newLine();

        $devMode = config('app.nginx.development_mode', true);

        if ($devMode) {
            $this->warn('Development mode - SSL renewal skipped.');
            $this->line('Set NGINX_DEV_MODE=false in production.');
            return 0;
        }

        $this->info('Running certbot renewal...');
        
        $result = $this->sslService->renewAllCertificates();

        if ($result['success']) {
            $this->info('✓ SSL renewal completed successfully.');
            if (isset($result['output'])) {
                $this->line($result['output']);
            }
            return 0;
        }

        $this->error('✗ SSL renewal failed.');
        if (isset($result['error'])) {
            $this->line($result['error']);
        }
        
        return 1;
    }
}
