<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => env('APP_TIMEZONE', 'UTC'),

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Multi-Tenant Hosting Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for shared hosting multi-tenant setup.
    | These paths are used to create symbolic links for tenant domains.
    |
    */

    // Hosting mode: 'vps' (Nginx config) or 'shared' (File copy for Hostinger)
    'hosting_mode' => env('HOSTING_MODE', 'shared'),
    
    // VPS Server IP (for DNS verification)
    'server_ip' => env('SERVER_IP', null),

    // Base path where all domains are stored (Hostinger structure)
    'domains_base_path' => env('DOMAINS_BASE_PATH', '/home/u938549775/domains'),
    
    // Path to the main frontend public_html folder
    'frontend_public_html' => env('FRONTEND_PUBLIC_HTML', '/home/u938549775/domains/lightgray-stork-866970.hostingersite.com/public_html'),
    
    // NGINX configuration paths (for VPS deployments)
    'nginx_config_path' => env('NGINX_CONFIG_PATH', '/etc/nginx/conf.d'),
    'nginx_sites_available' => env('NGINX_SITES_AVAILABLE', '/etc/nginx/sites-available'),
    'nginx_sites_enabled' => env('NGINX_SITES_ENABLED', '/etc/nginx/sites-enabled'),
    
    // Deployment base path for templates
    'deployment_base_path' => env('DEPLOYMENT_BASE_PATH', '/var/www/templates'),
    
    // Main frontend path (for VPS - single copy shared by all tenants)
    'vps_frontend_path' => env('VPS_FRONTEND_PATH', '/var/www/frontend/public'),
    
    // Admin email for SSL certificates
    'ssl_admin_email' => env('SSL_ADMIN_EMAIL', 'admin@example.com'),

];
