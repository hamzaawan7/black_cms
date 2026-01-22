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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('preview_image')->nullable();
            $table->text('description')->nullable();
            $table->string('version')->default('1.0.0');
            $table->boolean('is_active')->default(true);
            $table->json('supported_components')->nullable();
            $table->timestamps();
        });

        // Add template relationship to tenants
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('active_template_id')->nullable()->after('favicon')->constrained('templates')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['active_template_id']);
            $table->dropColumn('active_template_id');
        });

        Schema::dropIfExists('templates');
    }
};
