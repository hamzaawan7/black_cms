<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Media;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\TeamMember;
use App\Models\Testimonial;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get stats for the current tenant
        $stats = [
            'pages' => Page::count(),
            'services' => Service::count(),
            'media' => Media::count(),
            'testimonials' => Testimonial::count(),
            'faqs' => Faq::count(),
            'team_members' => TeamMember::count(),
            'categories' => ServiceCategory::count(),
            'published_pages' => Page::where('is_published', true)->count(),
            'draft_pages' => Page::where('is_published', false)->count(),
            'active_services' => Service::where('is_published', true)->count(),
        ];

        // Content distribution for pie chart
        $contentDistribution = [
            ['name' => 'Pages', 'value' => $stats['pages'], 'color' => '#c9a962'],
            ['name' => 'Services', 'value' => $stats['services'], 'color' => '#3d3d3d'],
            ['name' => 'Media', 'value' => $stats['media'], 'color' => '#6b7280'],
            ['name' => 'FAQs', 'value' => $stats['faqs'], 'color' => '#9a8b7a'],
            ['name' => 'Testimonials', 'value' => $stats['testimonials'], 'color' => '#d4af37'],
        ];

        // Services by category for bar chart
        $servicesByCategory = ServiceCategory::withCount('services')
            ->orderBy('services_count', 'desc')
            ->take(6)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'count' => $category->services_count,
                ];
            });

        // Monthly activity (simulated based on updated_at for last 6 months)
        $monthlyActivity = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthlyActivity->push([
                'month' => $date->format('M'),
                'pages' => Page::whereYear('updated_at', $date->year)
                    ->whereMonth('updated_at', $date->month)->count(),
                'services' => Service::whereYear('updated_at', $date->year)
                    ->whereMonth('updated_at', $date->month)->count(),
                'media' => Media::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)->count(),
            ]);
        }

        // Recent pages
        $recentPages = Page::orderBy('updated_at', 'desc')
            ->take(5)
            ->get(['id', 'title', 'slug', 'updated_at', 'is_published']);

        // Recent services
        $recentServices = Service::orderBy('updated_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'slug', 'is_published']);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentPages' => $recentPages,
            'recentServices' => $recentServices,
            'contentDistribution' => $contentDistribution,
            'servicesByCategory' => $servicesByCategory,
            'monthlyActivity' => $monthlyActivity,
        ]);
    }
}
