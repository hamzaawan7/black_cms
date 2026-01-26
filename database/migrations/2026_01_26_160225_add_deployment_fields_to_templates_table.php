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
        Schema::table('templates', function (Blueprint $table) {
            // GitHub repository info for deployment
            $table->string('github_repo')->nullable()->after('supported_components');
            $table->string('github_branch')->default('main')->after('github_repo');
            
            // Build configuration
            $table->string('build_command')->default('npm run build')->after('github_branch');
            $table->string('output_directory')->default('out')->after('build_command');
            $table->string('framework')->default('nextjs')->after('output_directory');
            
            // Default configuration for new tenants
            $table->json('default_settings')->nullable()->after('framework');
            $table->json('default_colors')->nullable()->after('default_settings');
            
            // Template category
            $table->string('category')->default('general')->after('default_colors');
            
            // Pricing (if templates are paid)
            $table->decimal('price', 10, 2)->default(0)->after('category');
            $table->boolean('is_premium')->default(false)->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn([
                'github_repo',
                'github_branch',
                'build_command',
                'output_directory',
                'framework',
                'default_settings',
                'default_colors',
                'category',
                'price',
                'is_premium',
            ]);
        });
    }
};
