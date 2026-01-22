<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Section;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PageService
{
    /**
     * Get all pages for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = Page::query();

        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated pages.
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Page::query();

        if (isset($filters['is_published'])) {
            $query->where('is_published', $filters['is_published']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', "%{$filters['search']}%")
                  ->orWhere('slug', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a page by ID with sections.
     */
    public function getById(int $id): ?Page
    {
        return Page::with(['sections' => function ($query) {
            $query->orderBy('order');
        }])->find($id);
    }

    /**
     * Get a page by slug.
     */
    public function getBySlug(string $slug): ?Page
    {
        return Page::with(['sections' => function ($query) {
            $query->orderBy('order');
        }])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();
    }

    /**
     * Create a new page.
     */
    public function create(array $data): Page
    {
        return DB::transaction(function () use ($data) {
            $page = Page::create($data);

            // Create default sections if template has them
            if (isset($data['sections']) && is_array($data['sections'])) {
                foreach ($data['sections'] as $index => $sectionData) {
                    $sectionData['page_id'] = $page->id;
                    $sectionData['order'] = $sectionData['order'] ?? $index;
                    Section::create($sectionData);
                }
            }

            return $page->load('sections');
        });
    }

    /**
     * Update a page.
     */
    public function update(Page $page, array $data): Page
    {
        return DB::transaction(function () use ($page, $data) {
            $page->update($data);

            return $page->fresh(['sections']);
        });
    }

    /**
     * Delete a page.
     */
    public function delete(Page $page): bool
    {
        return DB::transaction(function () use ($page) {
            // Sections will be deleted via cascade
            return $page->delete();
        });
    }

    /**
     * Duplicate a page.
     */
    public function duplicate(Page $page, string $newSlug): Page
    {
        return DB::transaction(function () use ($page, $newSlug) {
            $newPage = $page->replicate();
            $newPage->slug = $newSlug;
            $newPage->title = $page->title . ' (Copy)';
            $newPage->is_published = false;
            $newPage->save();

            // Duplicate sections
            foreach ($page->sections as $section) {
                $newSection = $section->replicate();
                $newSection->page_id = $newPage->id;
                $newSection->save();
            }

            return $newPage->load('sections');
        });
    }

    /**
     * Update page meta data.
     */
    public function updateMeta(Page $page, array $meta): Page
    {
        $currentMeta = $page->meta ?? [];
        $page->meta = array_merge($currentMeta, $meta);
        $page->save();

        return $page;
    }
}
