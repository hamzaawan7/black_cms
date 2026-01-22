<?php

namespace App\Repositories;

use App\Models\Page;
use App\Repositories\Contracts\PageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Page Repository Implementation
 */
class PageRepository extends BaseRepository implements PageRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param Page $model
     */
    public function __construct(Page $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getPublished(array $relations = []): Collection
    {
        return $this->query()
            ->where('is_published', true)
            ->with($relations)
            ->orderBy('title')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getWithSections(string $slug): ?Model
    {
        return $this->query()
            ->where('slug', $slug)
            ->with(['sections' => function ($q) {
                $q->where('is_published', true)->orderBy('order');
            }])
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function duplicate(int $pageId, string $newSlug): Model
    {
        return $this->transaction(function () use ($pageId, $newSlug) {
            $page = $this->findById($pageId, ['*'], ['sections']);

            if (!$page) {
                throw new \InvalidArgumentException("Page with ID {$pageId} not found");
            }

            // Create new page
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
     * Get pages with filtering and search.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15)
    {
        $query = $this->query()->withCount('sections');

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['title', 'slug', 'meta_title']);
        }

        return $query->orderBy('title')->paginate($perPage);
    }
}
