<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Additional domains (aliases, www versions, etc.)
            $table->json('additional_domains')->nullable()->after('domain');
            
            // Deployment configuration
            $table->string('api_base_url')->nullable()->after('additional_domains');
            $table->string('frontend_url')->nullable()->after('api_base_url');
            
            // Deployment status
            $table->enum('deployment_status', ['pending', 'deploying', 'active', 'failed', 'suspended'])
                ->default('pending')->after('frontend_url');
            $table->timestamp('deployed_at')->nullable()->after('deployment_status');
            
            // Branding
            $table->string('primary_color')->nullable()->after('deployed_at');
            $table->string('secondary_color')->nullable()->after('primary_color');
            $table->string('background_color')->nullable()->after('secondary_color');
            
            // Contact Information
            $table->string('contact_email')->nullable()->after('background_color');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->text('contact_address')->nullable()->after('contact_phone');
            $table->string('business_hours')->nullable()->after('contact_address');
            
            // Social Links
            $table->json('social_links')->nullable()->after('business_hours');
            
            // SEO defaults
            $table->string('meta_title')->nullable()->after('social_links');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_keywords')->nullable()->after('meta_description');
            
            // API Key for frontend authentication
            $table->string('api_key')->nullable()->unique()->after('meta_keywords');
            $table->timestamp('api_key_expires_at')->nullable()->after('api_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'additional_domains',
                'api_base_url',
                'frontend_url',
                'deployment_status',
                'deployed_at',
                'primary_color',
                'secondary_color',
                'background_color',
                'contact_email',
                'contact_phone',
                'contact_address',
                'business_hours',
                'social_links',
                'meta_title',
                'meta_description',
                'meta_keywords',
                'api_key',
                'api_key_expires_at',
            ]);
        });
    }
};
