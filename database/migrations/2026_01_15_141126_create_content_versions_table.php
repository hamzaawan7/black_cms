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
        Schema::create('content_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('versionable_type'); // Model class (Page, Section, Service)
            $table->unsignedBigInteger('versionable_id');
            $table->integer('version_number')->default(1);
            $table->json('content'); // Full snapshot of the model data
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('reason')->nullable(); // Optional reason for this version
            $table->boolean('is_current')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['versionable_type', 'versionable_id']);
            $table->index(['tenant_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_versions');
    }
};
