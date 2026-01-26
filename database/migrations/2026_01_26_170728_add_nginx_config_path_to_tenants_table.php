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
            // NGINX configuration file path for this tenant
            $table->string('nginx_config_path')->nullable()->after('deployment_status');
            
            // Deployment path where the template files are stored
            $table->string('deployment_path')->nullable()->after('nginx_config_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['nginx_config_path', 'deployment_path']);
        });
    }
};
