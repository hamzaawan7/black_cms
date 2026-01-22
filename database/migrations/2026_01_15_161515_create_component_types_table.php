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
        Schema::create('component_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('name'); // Display name: "Hero Section"
            $table->string('slug')->unique(); // Identifier: "hero"
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Icon name from lucide
            $table->json('fields'); // Field definitions
            $table->json('default_content')->nullable(); // Default content values
            $table->json('default_styles')->nullable(); // Default style values
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // System types can't be deleted
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['tenant_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('component_types');
    }
};
