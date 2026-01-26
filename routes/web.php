<?php

use App\Http\Controllers\Admin\ComponentTypeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\ServiceCategoryController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WebhookController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root to login page (or dashboard if authenticated)
Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return redirect('/login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        
        // Pages
        Route::resource('pages', PageController::class);
        Route::post('/pages/{page}/duplicate', [PageController::class, 'duplicate'])->name('pages.duplicate');
        
        // Sections (nested under pages)
        Route::post('/sections', [SectionController::class, 'store'])->name('sections.store');
        Route::put('/sections/{section}', [SectionController::class, 'update'])->name('sections.update');
        Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
        Route::post('/sections/reorder', [SectionController::class, 'reorder'])->name('sections.reorder');
        Route::post('/sections/{section}/move-up', [SectionController::class, 'moveUp'])->name('sections.move-up');
        Route::post('/sections/{section}/move-down', [SectionController::class, 'moveDown'])->name('sections.move-down');
        Route::post('/sections/{section}/duplicate', [SectionController::class, 'duplicate'])->name('sections.duplicate');
        Route::get('/sections/component-types', [SectionController::class, 'componentTypes'])->name('sections.component-types');
        
        // Services
        Route::resource('services', ServiceController::class);
        Route::post('/services/reorder', [ServiceController::class, 'reorder'])->name('services.reorder');
        Route::post('/services/{service}/toggle-popular', [ServiceController::class, 'togglePopular'])->name('services.toggle-popular');
        Route::post('/services/{service}/toggle-published', [ServiceController::class, 'togglePublished'])->name('services.toggle-published');
        
        // Service Categories
        Route::resource('service-categories', ServiceCategoryController::class);
        Route::post('/service-categories/reorder', [ServiceCategoryController::class, 'reorder'])->name('service-categories.reorder');
        
        // API endpoint for SectionBuilder to get categories with services
        Route::get('/api/categories-with-services', [ServiceCategoryController::class, 'getCategoriesWithServices'])->name('api.categories-with-services');
        
        // Media
        Route::get('/media', [MediaController::class, 'index'])->name('media.index');
        Route::post('/media', [MediaController::class, 'store'])->name('media.store');
        Route::post('/media/upload', [MediaController::class, 'store'])->name('media.upload'); // Alias for MediaUploader component
        Route::put('/media/{media}', [MediaController::class, 'update'])->name('media.update');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy');
        Route::post('/media/{media}/move', [MediaController::class, 'move'])->name('media.move');
        Route::get('/media/picker', [MediaController::class, 'picker'])->name('media.picker');
        
        // Testimonials
        Route::resource('testimonials', TestimonialController::class);
        Route::post('/testimonials/reorder', [TestimonialController::class, 'reorder'])->name('testimonials.reorder');
        Route::post('/testimonials/{testimonial}/toggle-featured', [TestimonialController::class, 'toggleFeatured'])->name('testimonials.toggle-featured');
        Route::post('/testimonials/{testimonial}/toggle-published', [TestimonialController::class, 'togglePublished'])->name('testimonials.toggle-published');
        
        // FAQs
        Route::resource('faqs', FaqController::class);
        Route::post('/faqs/reorder', [FaqController::class, 'reorder'])->name('faqs.reorder');
        Route::post('/faqs/{faq}/toggle-published', [FaqController::class, 'togglePublished'])->name('faqs.toggle-published');
        
        // Team Members (aliased to /team for frontend compatibility)
        Route::resource('team', TeamMemberController::class)->parameters(['team' => 'teamMember']);
        Route::post('/team/reorder', [TeamMemberController::class, 'reorder'])->name('team.reorder');
        Route::post('/team/{teamMember}/toggle-published', [TeamMemberController::class, 'togglePublished'])->name('team.toggle-published');
        
        // Menus
        Route::resource('menus', MenuController::class);
        Route::post('/menus/{menu}/toggle-active', [MenuController::class, 'toggleActive'])->name('menus.toggle-active');
        
        // Component Types (for page sections)
        Route::resource('component-types', ComponentTypeController::class)->except(['show']);
        Route::post('/component-types/{componentType}/toggle-active', [ComponentTypeController::class, 'toggleActive'])->name('component-types.toggle-active');
        
        // ==========================================
        // SUPER ADMIN ONLY ROUTES
        // ==========================================
        Route::middleware(['role:super_admin'])->group(function () {
            // Users
            Route::resource('users', UserController::class);
            Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
            
            // Tenants
            Route::resource('tenants', TenantController::class);
            Route::post('/tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');
            Route::post('/tenants/{tenant}/duplicate', [TenantController::class, 'duplicate'])->name('tenants.duplicate');
            
            // Templates
            Route::resource('templates', TemplateController::class);
            Route::post('/templates/{template}/toggle-active', [TemplateController::class, 'toggleActive'])->name('templates.toggle-active');
        });
        
        // Settings (Admin & Tenant Admin only)
        Route::middleware(['role:super_admin,tenant_admin'])->group(function () {
            Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
            Route::get('/settings/group/{group}', [SettingController::class, 'group'])->name('settings.group');
            Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
            Route::post('/settings/initialize', [SettingController::class, 'initialize'])->name('settings.initialize');
            
            // Webhooks
            Route::resource('webhooks', WebhookController::class)->except(['show']);
            Route::post('/webhooks/{webhook}/test', [WebhookController::class, 'test'])->name('webhooks.test');
        });
    });
});

require __DIR__.'/auth.php';
