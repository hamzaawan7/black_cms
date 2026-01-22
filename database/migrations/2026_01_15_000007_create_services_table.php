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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('service_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('headline')->nullable();
            $table->string('pricing')->nullable();
            $table->string('image')->nullable();
            $table->string('secondary_image')->nullable();
            $table->string('vial_image')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_published')->default(true);
            $table->integer('order')->default(0);
            $table->json('content')->nullable(); // Detailed content blocks
            $table->json('stats')->nullable(); // Service statistics
            $table->json('benefits')->nullable();
            $table->json('what_is')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
