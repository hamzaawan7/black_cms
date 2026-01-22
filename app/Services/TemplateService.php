<?php

namespace App\Services;

use App\Models\Template;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Template Service
 * 
 * Handles business logic for template management.
 */
class TemplateService
{
    /**
     * @var TemplateRepositoryInterface
     */
    protected TemplateRepositoryInterface $templateRepository;

    /**
     * Create a new service instance.
     *
     * @param TemplateRepositoryInterface $templateRepository
     */
    public function __construct(TemplateRepositoryInterface $templateRepository)
    {
        $this->templateRepository = $templateRepository;
    }

    /**
     * Get paginated templates with tenant count.
     *
     * @param int $perPage
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->templateRepository->getPaginatedWithTenantCount($filters, $perPage);
    }

    /**
     * Get all active templates.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return $this->templateRepository->getActive();
    }

    /**
     * Get templates for select options.
     *
     * @return Collection
     */
    public function getForSelect(): Collection
    {
        return $this->templateRepository->getForSelect();
    }

    /**
     * Find template by ID.
     *
     * @param int $id
     * @return Template|null
     */
    public function findById(int $id): ?Template
    {
        return $this->templateRepository->findById($id);
    }

    /**
     * Find template by slug.
     *
     * @param string $slug
     * @return Template|null
     */
    public function findBySlug(string $slug): ?Template
    {
        return $this->templateRepository->findBySlug($slug);
    }

    /**
     * Create a new template.
     *
     * @param array $data
     * @return Template
     */
    public function create(array $data): Template
    {
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        // Set default values
        $data['is_active'] = $data['is_active'] ?? true;
        $data['supported_components'] = $data['supported_components'] ?? [];

        return $this->templateRepository->create($data);
    }

    /**
     * Update a template.
     *
     * @param Template $template
     * @param array $data
     * @return Template
     */
    public function update(Template $template, array $data): Template
    {
        // Regenerate slug if name changed and slug not explicitly provided
        if (isset($data['name']) && empty($data['slug']) && $data['name'] !== $template->name) {
            $data['slug'] = $this->generateUniqueSlug($data['name'], $template->id);
        }

        $this->templateRepository->update($template->id, $data);

        return $template->fresh();
    }

    /**
     * Delete a template.
     *
     * @param Template $template
     * @return bool
     */
    public function delete(Template $template): bool
    {
        return $this->templateRepository->deleteById($template->id);
    }

    /**
     * Toggle template active status.
     *
     * @param Template $template
     * @return Template
     */
    public function toggleActive(Template $template): Template
    {
        $this->templateRepository->toggleActive($template->id);

        return $template->fresh();
    }

    /**
     * Check if template can be deleted.
     *
     * @param Template $template
     * @return bool
     */
    public function canDelete(Template $template): bool
    {
        return !$this->templateRepository->isInUse($template->id);
    }

    /**
     * Get count of tenants using this template.
     *
     * @param Template $template
     * @return int
     */
    public function getTenantCount(Template $template): int
    {
        return $this->templateRepository->getTenantCount($template->id);
    }

    /**
     * Get template statistics.
     *
     * @return array
     */
    public function getStatistics(): array
    {
        $all = $this->templateRepository->all();

        return [
            'total' => $all->count(),
            'active' => $all->where('is_active', true)->count(),
            'inactive' => $all->where('is_active', false)->count(),
            'in_use' => $all->filter(function ($template) {
                return $this->templateRepository->isInUse($template->id);
            })->count(),
        ];
    }

    /**
     * Generate a unique slug for the template.
     *
     * @param string $name
     * @param int|null $excludeId
     * @return string
     */
    protected function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug already exists.
     *
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    protected function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $existing = $this->templateRepository->findBySlug($slug);

        if (!$existing) {
            return false;
        }

        return $excludeId === null || $existing->id !== $excludeId;
    }

    /**
     * Get all templates.
     *
     * @param bool $activeOnly
     * @return Collection
     */
    public function getAll(bool $activeOnly = false): Collection
    {
        if ($activeOnly) {
            return $this->getActive();
        }
        return $this->templateRepository->all();
    }

    /**
     * Get a template by slug (alias for findBySlug).
     *
     * @param string $slug
     * @return Template|null
     */
    public function getBySlug(string $slug): ?Template
    {
        return $this->findBySlug($slug);
    }

    /**
     * Get the tenant's active template.
     *
     * @param \App\Models\Tenant $tenant
     * @return Template|null
     */
    public function getTenantTemplate(\App\Models\Tenant $tenant): ?Template
    {
        return $tenant->activeTemplate;
    }

    /**
     * Switch a tenant's template.
     *
     * @param \App\Models\Tenant $tenant
     * @param Template $template
     * @return \App\Models\Tenant
     */
    public function switchTenantTemplate(\App\Models\Tenant $tenant, Template $template): \App\Models\Tenant
    {
        $tenant->update(['active_template_id' => $template->id]);
        return $tenant->fresh();
    }

    /**
     * Get preview data for a template applied to a tenant.
     *
     * @param \App\Models\Tenant $tenant
     * @param Template $template
     * @return array
     */
    public function getPreviewData(\App\Models\Tenant $tenant, Template $template): array
    {
        return [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'slug' => $template->slug,
                'description' => $template->description,
                'preview_image' => $template->preview_image,
                'version' => $template->version,
                'supported_components' => $template->supported_components ?? [],
            ],
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
            ],
            'current_template' => $tenant->activeTemplate ? [
                'id' => $tenant->activeTemplate->id,
                'name' => $tenant->activeTemplate->name,
                'slug' => $tenant->activeTemplate->slug,
            ] : null,
            'would_change' => $tenant->active_template_id !== $template->id,
        ];
    }

    /**
     * Check if a template supports a specific component.
     *
     * @param Template $template
     * @param string $component
     * @return bool
     */
    public function supportsComponent(Template $template, string $component): bool
    {
        $components = $template->supported_components ?? [];
        return in_array($component, $components, true);
    }
}
