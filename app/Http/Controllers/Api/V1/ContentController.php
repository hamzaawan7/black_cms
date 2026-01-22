<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ContentController extends Controller
{
    /**
     * Get all FAQs.
     */
    public function faqs(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:faqs";

        $faqs = Cache::remember($cacheKey, 3600, function () use ($tenant) {
            return $tenant->faqs()
                ->where('is_published', true)
                ->orderBy('order')
                ->get()
                ->map(function ($faq) {
                    return [
                        'id' => $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'category' => $faq->category,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Get all testimonials.
     */
    public function testimonials(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:testimonials";

        $testimonials = Cache::remember($cacheKey, 3600, function () use ($tenant) {
            return $tenant->testimonials()
                ->where('is_published', true)
                ->orderBy('order')
                ->get()
                ->map(function ($testimonial) {
                    return [
                        'id' => $testimonial->id,
                        'authorName' => $testimonial->author_name,
                        'authorTitle' => $testimonial->author_title,
                        'authorImage' => $testimonial->author_image,
                        'content' => $testimonial->content,
                        'rating' => $testimonial->rating,
                        'featured' => $testimonial->is_featured,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    /**
     * Get all team members.
     */
    public function team(string $tenantSlug): JsonResponse
    {
        $tenant = $this->getTenant($tenantSlug);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        $cacheKey = "tenant:{$tenant->id}:team";

        $team = Cache::remember($cacheKey, 3600, function () use ($tenant) {
            return $tenant->teamMembers()
                ->where('is_published', true)
                ->orderBy('order')
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'title' => $member->title,
                        'bio' => $member->bio,
                        'image' => $member->image,
                        'credentials' => $member->credentials,
                        'socialLinks' => $member->social_links,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'data' => $team,
        ]);
    }

    /**
     * Get tenant by slug.
     */
    private function getTenant(string $slug): ?Tenant
    {
        return Cache::remember("tenant:slug:{$slug}", 3600, function () use ($slug) {
            return Tenant::where('slug', $slug)
                ->where('is_active', true)
                ->first();
        });
    }
}
