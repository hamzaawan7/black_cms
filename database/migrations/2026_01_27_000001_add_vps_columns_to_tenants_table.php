<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add VPS-related columns to tenants table
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Nginx config tracking
            $table->string('nginx_config_file')->nullable()->after('domain');
            $table->enum('nginx_status', ['pending', 'active', 'error', 'deleted'])->default('pending')->after('nginx_config_file');
            
            // SSL tracking
            $table->enum('ssl_status', ['pending', 'active', 'error', 'expired'])->default('pending')->after('nginx_status');
            $table->timestamp('ssl_expires_at')->nullable()->after('ssl_status');
            
            // DNS verification
            $table->boolean('dns_verified')->default(false)->after('ssl_expires_at');
            $table->timestamp('dns_verified_at')->nullable()->after('dns_verified');
            
            // Server info
            $table->string('server_ip')->nullable()->after('dns_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'nginx_config_file',
                'nginx_status',
                'ssl_status',
                'ssl_expires_at',
                'dns_verified',
                'dns_verified_at',
                'server_ip',
            ]);
        });
    }
};
