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
        Schema::table('pages', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->after('published_at');
            $table->string('publish_status')->default('draft')->after('is_published'); // draft, scheduled, published
        });

        Schema::table('services', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->after('is_published');
            $table->string('publish_status')->default('draft')->after('is_published'); // draft, scheduled, published
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['scheduled_at', 'publish_status']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['scheduled_at', 'publish_status']);
        });
    }
};
