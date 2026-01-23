<?php

use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\PageBuilderController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\PageDataController;
use App\Http\Controllers\Api\V1\SectionController;
use App\Http\Controllers\Api\V1\ServiceCategoryController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\SiteController;
use App\Http\Controllers\Api\V1\TeamMemberController;
use App\Http\Controllers\Api\V1\TemplateController;
use App\Http\Controllers\Api\V1\TestimonialController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// API Version 1
Route::prefix('v1')->group(function () {
    
    // Health check
    Route::get('/health', [SiteController::class, 'health']);
    
    // Site configuration (requires tenant ID header or query param)
    Route::get('/site/config', [SiteController::class, 'config']);
    Route::get('/site/domain/{domain}', [SiteController::class, 'byDomain'])->where('domain', '.*');
    
    // Tenant resolution endpoint - auto-detect tenant from request headers/domain
    Route::get('/site/resolve', [SiteController::class, 'resolve']);
    
    // ==========================================
    // PUBLIC API (for frontend consumption)
    // These require X-Tenant-ID header middleware
    // ==========================================
    Route::middleware(['tenant'])->group(function () {
        
        // Pages
        Route::get('/pages', [PageController::class, 'index']);
        Route::get('/pages/{slug}', [PageController::class, 'show'])->where('slug', '.*');
        
        // Services
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/popular', [ServiceController::class, 'popular']);
        Route::get('/services/category/{categoryId}', [ServiceController::class, 'byCategory']);
        Route::get('/services/{slug}', [ServiceController::class, 'show']);
        
        // Service Categories
        Route::get('/categories', [ServiceCategoryController::class, 'index']);
        Route::get('/categories/{slug}', [ServiceCategoryController::class, 'show']);
        
        // FAQs
        Route::get('/faqs', [FaqController::class, 'index']);
        Route::get('/faqs/grouped', [FaqController::class, 'grouped']);
        Route::get('/faqs/categories', [FaqController::class, 'categories']);
        
        // Testimonials
        Route::get('/testimonials', [TestimonialController::class, 'index']);
        Route::get('/testimonials/featured', [TestimonialController::class, 'featured']);
        Route::get('/testimonials/service/{serviceId}', [TestimonialController::class, 'byService']);
        Route::get('/testimonials/rating', [TestimonialController::class, 'averageRating']);
        
        // Team Members
        Route::get('/team', [TeamMemberController::class, 'index']);
        Route::get('/team/{id}', [TeamMemberController::class, 'show']);
        
        // Menus
        Route::get('/menus', [MenuController::class, 'index']);
        Route::get('/menus/location/{location}', [MenuController::class, 'byLocation']);
        Route::get('/menus/locations', [MenuController::class, 'locations']);
        
        // Settings
        Route::get('/settings', [SettingController::class, 'index']);
        Route::get('/settings/group/{group}', [SettingController::class, 'byGroup']);
        Route::get('/settings/{key}', [SettingController::class, 'show']);
        
        // Templates
        Route::get('/templates', [TemplateController::class, 'index']);
        Route::get('/templates/current', [TemplateController::class, 'current']);
        Route::get('/templates/{slug}', [TemplateController::class, 'show']);
        Route::get('/templates/{slug}/components', [TemplateController::class, 'components']);
        Route::get('/templates/{slug}/preview', [TemplateController::class, 'preview']);
        Route::post('/templates/switch', [TemplateController::class, 'switchTemplate']);
        Route::post('/templates/supports-component', [TemplateController::class, 'supportsComponent']);
        
        // Template CRUD (for admin)
        Route::post('/templates', [TemplateController::class, 'store']);
        Route::put('/templates/{slug}', [TemplateController::class, 'update']);
        Route::delete('/templates/{slug}', [TemplateController::class, 'destroy']);
        
        // Section Types (public - for page builder)
        Route::get('/section-types', [SectionController::class, 'types']);
        Route::get('/section-types/{type}', [SectionController::class, 'typeSchema']);
        Route::get('/section-types/{type}/defaults', [SectionController::class, 'typeDefaults']);
        
        // Sections (page builder API)
        Route::get('/pages/{pageId}/sections', [SectionController::class, 'index']);
        Route::post('/sections', [SectionController::class, 'store']);
        Route::get('/sections/{id}', [SectionController::class, 'show']);
        Route::put('/sections/{id}', [SectionController::class, 'update']);
        Route::delete('/sections/{id}', [SectionController::class, 'destroy']);
        Route::post('/sections/reorder', [SectionController::class, 'reorder']);
        Route::post('/sections/{id}/move-up', [SectionController::class, 'moveUp']);
        Route::post('/sections/{id}/move-down', [SectionController::class, 'moveDown']);
        Route::post('/sections/{id}/toggle-visibility', [SectionController::class, 'toggleVisibility']);
        Route::post('/sections/{id}/duplicate', [SectionController::class, 'duplicate']);
        
        // Page Builder (comprehensive page editing API)
        Route::prefix('page-builder')->group(function () {
            // Get all pages for page builder
            Route::get('/pages', [PageBuilderController::class, 'getPages']);
            
            // Get page with all sections for editing
            Route::get('/pages/{slug}', [PageBuilderController::class, 'getPage']);
            
            // Add new section to page
            Route::post('/pages/{slug}/sections', [PageBuilderController::class, 'addSection']);
            
            // Reorder sections (drag & drop)
            Route::post('/pages/{slug}/reorder', [PageBuilderController::class, 'reorderSections']);
            
            // Section CRUD
            Route::put('/sections/{id}', [PageBuilderController::class, 'updateSection']);
            Route::delete('/sections/{id}', [PageBuilderController::class, 'deleteSection']);
            Route::post('/sections/{id}/move-up', [PageBuilderController::class, 'moveSectionUp']);
            Route::post('/sections/{id}/move-down', [PageBuilderController::class, 'moveSectionDown']);
            Route::post('/sections/{id}/toggle', [PageBuilderController::class, 'toggleVisibility']);
            Route::post('/sections/{id}/duplicate', [PageBuilderController::class, 'duplicateSection']);
            Route::get('/sections/{id}/preview', [PageBuilderController::class, 'previewSection']);
            
            // Featured Products (hero slider)
            Route::get('/featured-products', [PageBuilderController::class, 'getFeaturedProducts']);
            Route::put('/sections/{id}/featured-products', [PageBuilderController::class, 'updateFeaturedProducts']);
            
            // Media Library
            Route::get('/media', [PageBuilderController::class, 'getMediaLibrary']);
            Route::post('/media', [PageBuilderController::class, 'uploadMedia']);
            Route::post('/media/upload', [PageBuilderController::class, 'uploadMedia']); // Alias for settings page
        });
        
        // Webhooks & Cache Invalidation
        Route::get('/webhooks/health', [WebhookController::class, 'health']);
        Route::get('/webhooks/cache-stats', [WebhookController::class, 'cacheStats']);
        Route::post('/webhooks/clear-cache', [WebhookController::class, 'clearCache']);
        Route::post('/webhooks/revalidate', [WebhookController::class, 'revalidate']);
        Route::post('/webhooks/content-changed', [WebhookController::class, 'contentChanged']);
        Route::get('/webhooks', [WebhookController::class, 'list']);
        Route::post('/webhooks', [WebhookController::class, 'register']);
        Route::delete('/webhooks/{id}', [WebhookController::class, 'delete']);
    });
    
    // ==========================================
    // LEGACY ROUTES (for backward compatibility)
    // ==========================================
    Route::prefix('{tenant}')->group(function () {
        Route::get('/services', [ServiceController::class, 'legacyIndex']);
        Route::get('/services/{service}', [ServiceController::class, 'legacyShow']);
        
        // Page Data - optimized combined endpoint
        Route::get('/page-data/{pageSlug?}', [PageDataController::class, 'show']);
    });
});
