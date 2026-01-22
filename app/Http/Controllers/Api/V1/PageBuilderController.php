<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Section;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\SectionTypeRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Page Builder Controller
 * 
 * Provides comprehensive page building functionality including:
 * - Section management (CRUD, reorder, visibility)
 * - Content editing with media support
 * - Preview functionality
 * - Drag & drop reordering
 */
class PageBuilderController extends Controller
{
    protected SectionTypeRegistry $registry;

    public function __construct(SectionTypeRegistry $registry)
    {
        $this->registry = $registry;
    }

    /**
     * Get page with all sections for editing
     */
    public function getPage(Request $request, string $slug): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        
        $page = Page::where('slug', $slug)
            ->where('tenant_id', $this->getTenantId($tenantId))
            ->with(['sections' => function ($query) {
                $query->orderBy('order', 'asc');
            }])
            ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        // Get available section types
        $sectionTypes = $this->registry->getAllTypesWithSchema();

        return response()->json([
            'success' => true,
            'data' => [
                'page' => $page,
                'sections' => $page->sections->map(function ($section) {
                    return [
                        'id' => $section->id,
                        'component_type' => $section->component_type,
                        'order' => $section->order,
                        'is_visible' => $section->is_visible,
                        'content' => $section->content,
                        'styles' => $section->styles,
                        'settings' => $section->settings,
                        'type_info' => $this->registry->getTypeSchema($section->component_type),
                    ];
                }),
                'available_types' => $sectionTypes,
            ],
        ]);
    }

    /**
     * Add a new section to a page
     */
    public function addSection(Request $request, string $pageSlug): JsonResponse
    {
        $request->validate([
            'component_type' => 'required|string',
            'position' => 'nullable|integer', // Insert at position, null = end
            'content' => 'nullable|array',
            'styles' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        
        $page = Page::where('slug', $pageSlug)
            ->where('tenant_id', $this->getTenantId($tenantId))
            ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        $componentType = $request->input('component_type');
        
        if (!$this->registry->isValidType($componentType)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid section type: ' . $componentType,
                'available_types' => $this->registry->getAllTypes(),
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Get position for new section
            $position = $request->input('position');
            if ($position === null) {
                $position = Section::where('page_id', $page->id)->max('order') + 1;
            } else {
                // Shift existing sections down
                Section::where('page_id', $page->id)
                    ->where('order', '>=', $position)
                    ->increment('order');
            }

            // Get defaults from registry
            $defaults = $this->registry->getDefaultContent($componentType);
            $typeSchema = $this->registry->getTypeSchema($componentType);

            // Create section with defaults merged with provided content
            $section = Section::create([
                'page_id' => $page->id,
                'component_type' => $componentType,
                'order' => $position,
                'is_visible' => true,
                'content' => array_merge($defaults, $request->input('content', [])),
                'styles' => $request->input('styles', $this->getDefaultStyles()),
                'settings' => $request->input('settings', []),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section added successfully',
                'data' => [
                    'section' => $section,
                    'type_info' => $typeSchema,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add section: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a section
     */
    public function updateSection(Request $request, int $sectionId): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        $updateData = [];
        
        if ($request->has('content')) {
            $updateData['content'] = array_merge(
                $section->content ?? [],
                $request->input('content')
            );
        }
        
        if ($request->has('styles')) {
            $updateData['styles'] = array_merge(
                $section->styles ?? [],
                $request->input('styles')
            );
        }
        
        if ($request->has('settings')) {
            $updateData['settings'] = array_merge(
                $section->settings ?? [],
                $request->input('settings')
            );
        }
        
        if ($request->has('is_visible')) {
            $updateData['is_visible'] = $request->boolean('is_visible');
        }

        $section->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Section updated successfully',
            'data' => $section->fresh(),
        ]);
    }

    /**
     * Delete a section
     */
    public function deleteSection(int $sectionId): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        $pageId = $section->page_id;
        $order = $section->order;

        DB::beginTransaction();
        try {
            $section->delete();

            // Reorder remaining sections
            Section::where('page_id', $pageId)
                ->where('order', '>', $order)
                ->decrement('order');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section deleted successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete section: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder sections (drag & drop)
     */
    public function reorderSections(Request $request, string $pageSlug): JsonResponse
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer',
            'sections.*.order' => 'required|integer|min:1',
        ]);

        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        
        $page = Page::where('slug', $pageSlug)
            ->where('tenant_id', $this->getTenantId($tenantId))
            ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found',
            ], 404);
        }

        DB::beginTransaction();
        try {
            foreach ($request->input('sections') as $sectionData) {
                Section::where('id', $sectionData['id'])
                    ->where('page_id', $page->id)
                    ->update(['order' => $sectionData['order']]);
            }

            DB::commit();

            // Return updated sections
            $sections = Section::where('page_id', $page->id)
                ->orderBy('order')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Sections reordered successfully',
                'data' => $sections,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder sections: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Move section up
     */
    public function moveSectionUp(int $sectionId): JsonResponse
    {
        return $this->moveSection($sectionId, 'up');
    }

    /**
     * Move section down
     */
    public function moveSectionDown(int $sectionId): JsonResponse
    {
        return $this->moveSection($sectionId, 'down');
    }

    /**
     * Toggle section visibility
     */
    public function toggleVisibility(int $sectionId): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        $section->update(['is_visible' => !$section->is_visible]);

        return response()->json([
            'success' => true,
            'message' => 'Section visibility toggled',
            'data' => [
                'id' => $section->id,
                'is_visible' => $section->is_visible,
            ],
        ]);
    }

    /**
     * Duplicate a section
     */
    public function duplicateSection(int $sectionId): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        DB::beginTransaction();
        try {
            // Shift sections after the original
            Section::where('page_id', $section->page_id)
                ->where('order', '>', $section->order)
                ->increment('order');

            // Create duplicate
            $duplicate = Section::create([
                'page_id' => $section->page_id,
                'component_type' => $section->component_type,
                'order' => $section->order + 1,
                'is_visible' => false, // Start hidden
                'content' => $section->content,
                'styles' => $section->styles,
                'settings' => $section->settings,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section duplicated successfully',
                'data' => $duplicate,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to duplicate section: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get featured products for hero slider
     * Returns products from services that can be featured in hero
     */
    public function getFeaturedProducts(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        
        $services = Service::where('tenant_id', $this->getTenantId($tenantId))
            ->where('is_active', true)
            ->orderBy('order')
            ->get(['id', 'slug', 'name', 'description', 'image', 'is_popular']);

        return response()->json([
            'success' => true,
            'data' => $services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'image' => $service->image ? url('storage/' . $service->image) : null,
                    'is_popular' => $service->is_popular,
                ];
            }),
        ]);
    }

    /**
     * Update featured products in hero section
     */
    public function updateFeaturedProducts(Request $request, int $sectionId): JsonResponse
    {
        $request->validate([
            'featured_products' => 'required|array',
            'featured_products.*.name' => 'required|string',
            'featured_products.*.slug' => 'required|string',
            'featured_products.*.description' => 'nullable|string',
            'featured_products.*.image' => 'nullable|string',
        ]);

        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        if ($section->component_type !== 'hero') {
            return response()->json([
                'success' => false,
                'message' => 'This endpoint is only for hero sections',
            ], 400);
        }

        $content = $section->content ?? [];
        $content['featured_products'] = $request->input('featured_products');
        
        $section->update(['content' => $content]);

        return response()->json([
            'success' => true,
            'message' => 'Featured products updated successfully',
            'data' => $section->fresh(),
        ]);
    }

    /**
     * Get section preview HTML
     */
    public function previewSection(Request $request, int $sectionId): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        // Return section data for preview
        return response()->json([
            'success' => true,
            'data' => [
                'section' => $section,
                'preview_url' => config('app.frontend_url', 'http://localhost:3000') . 
                    '/api/preview?section=' . $sectionId,
            ],
        ]);
    }

    /**
     * Get media library for section images
     */
    public function getMediaLibrary(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        $folder = $request->input('folder', 'media');

        $files = Storage::disk('public')->files($folder);
        
        $media = collect($files)->map(function ($path) {
            return [
                'path' => $path,
                'url' => url('storage/' . $path),
                'name' => basename($path),
                'size' => Storage::disk('public')->size($path),
                'type' => $this->getFileType($path),
            ];
        })->filter(function ($file) {
            return in_array($file['type'], ['image', 'video']);
        })->values();

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }

    /**
     * Upload media for sections
     */
    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,svg,mp4|max:10240',
            'folder' => 'nullable|string',
        ]);

        $folder = $request->input('folder', 'media/pages');
        $file = $request->file('file');
        
        $path = $file->store($folder, 'public');

        return response()->json([
            'success' => true,
            'message' => 'Media uploaded successfully',
            'data' => [
                'path' => $path,
                'url' => url('storage/' . $path),
                'name' => $file->getClientOriginalName(),
            ],
        ]);
    }

    /**
     * Get all pages for page builder
     */
    public function getPages(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->get('tenant_id');
        
        $pages = Page::where('tenant_id', $this->getTenantId($tenantId))
            ->withCount('sections')
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'slug' => $page->slug,
                    'title' => $page->title,
                    'is_published' => $page->is_published,
                    'sections_count' => $page->sections_count,
                    'updated_at' => $page->updated_at,
                ];
            }),
        ]);
    }

    // ========================================
    // Helper Methods
    // ========================================

    protected function moveSection(int $sectionId, string $direction): JsonResponse
    {
        $section = Section::find($sectionId);

        if (!$section) {
            return response()->json([
                'success' => false,
                'message' => 'Section not found',
            ], 404);
        }

        $currentOrder = $section->order;
        $newOrder = $direction === 'up' ? $currentOrder - 1 : $currentOrder + 1;

        // Find the section to swap with
        $swapSection = Section::where('page_id', $section->page_id)
            ->where('order', $newOrder)
            ->first();

        if (!$swapSection) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot move section ' . $direction,
            ], 400);
        }

        DB::beginTransaction();
        try {
            $swapSection->update(['order' => $currentOrder]);
            $section->update(['order' => $newOrder]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Section moved ' . $direction,
                'data' => [
                    'section' => $section->fresh(),
                    'swapped_with' => $swapSection->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to move section: ' . $e->getMessage(),
            ], 500);
        }
    }

    protected function getTenantId(?string $identifier): ?int
    {
        if (!$identifier) {
            return null;
        }

        $tenant = \App\Models\Tenant::where('slug', $identifier)
            ->orWhere('id', $identifier)
            ->orWhere('domain', $identifier)
            ->first();

        return $tenant?->id;
    }

    protected function getDefaultStyles(): array
    {
        return [
            'background_color' => '#ffffff',
            'text_color' => '#6b6b6b',
            'heading_color' => '#3d3d3d',
            'font_size' => 'base',
            'padding_top' => 'lg',
            'padding_bottom' => 'lg',
            'container_width' => 'default',
            'custom_css_class' => '',
        ];
    }

    protected function getFileType(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
            return 'image';
        }
        
        if (in_array($extension, ['mp4', 'webm', 'mov'])) {
            return 'video';
        }
        
        return 'file';
    }
}
