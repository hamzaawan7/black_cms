<?php

namespace App\Repositories;

use App\Models\Template;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Template Repository Implementation
 * 
 * Implements data access operations for Template model.
 */
class TemplateRepository extends BaseRepository implements TemplateRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param Template $model
     */
    public function __construct(Template $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getActive(): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getPaginatedWithTenantCount(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->query()->withCount('tenants');

        // Apply search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply active filter
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * {@inheritDoc}
     */
    public function toggleActive(int $templateId): bool
    {
        $template = $this->findById($templateId);

        if (!$template) {
            return false;
        }

        $template->is_active = !$template->is_active;
        return $template->save();
    }

    /**
     * {@inheritDoc}
     */
    public function getForSelect(): Collection
    {
        return $this->query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'preview_image']);
    }

    /**
     * {@inheritDoc}
     */
    public function isInUse(int $templateId): bool
    {
        return $this->getTenantCount($templateId) > 0;
    }

    /**
     * {@inheritDoc}
     */
    public function getTenantCount(int $templateId): int
    {
        $template = $this->findById($templateId);

        if (!$template) {
            return 0;
        }

        return $template->tenants()->count();
    }
}
