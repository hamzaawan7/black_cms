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
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('component_type'); // e.g., 'hero', 'services-grid', 'team', 'faq'
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('content')->nullable(); // Component-specific content data
            $table->json('styles')->nullable(); // Background, colors, spacing, etc.
            $table->json('settings')->nullable(); // Component-specific settings
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
