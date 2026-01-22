<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Template;
use App\Repositories\Contracts\TenantRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Tenant Service
 * 
 * Handles business logic for tenant management.
 */
class TenantService
{
    /**
     * @var TenantRepositoryInterface
     */
    protected TenantRepositoryInterface $tenantRepository;

    /**
     * @var SettingService
     */
    protected SettingService $settingService;

    /**
     * Create a new service instance.
     *
     * @param TenantRepositoryInterface $tenantRepository
     * @param SettingService $settingService
     */
    public function __construct(
        TenantRepositoryInterface $tenantRepository,
        SettingService $settingService
    ) {
        $this->tenantRepository = $tenantRepository;
        $this->settingService = $settingService;
    }

    /**
     * Get paginated tenants.
     *
     * @param int $perPage
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        unset($filters['search']);

        return $this->tenantRepository->getFiltered($filters, $search, $perPage);
    }

    /**
     * Get all tenants.
     */
    public function getAll(): Collection
    {
        return Tenant::with('activeTemplate')->orderBy('name')->get();
    }

    /**
     * Get a tenant by ID.
     */
    public function getById(int $id): ?Tenant
    {
        return Tenant::with(['activeTemplate', 'users'])->find($id);
    }

    /**
     * Get a tenant by domain.
     */
    public function getByDomain(string $domain): ?Tenant
    {
        return Tenant::with('activeTemplate')
            ->where('domain', $domain)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get a tenant by slug.
     */
    public function getBySlug(string $slug): ?Tenant
    {
        return Tenant::with('activeTemplate')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Create a new tenant.
     */
    public function create(array $data): Tenant
    {
        // Generate slug if not provided
        if (!isset($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

        $tenant = Tenant::create($data);

        // Initialize default settings for the tenant
        // Note: This would need to be run in tenant context
        // $this->settingService->initializeDefaults();

        return $tenant->load('activeTemplate');
    }

    /**
     * Update a tenant.
     */
    public function update(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);
        return $tenant->fresh(['activeTemplate']);
    }

    /**
     * Delete a tenant.
     */
    public function delete(Tenant $tenant): bool
    {
        // Note: This will cascade delete all tenant data
        // Make sure to handle media files cleanup
        return $tenant->delete();
    }

    /**
     * Toggle tenant active status.
     */
    public function toggleActive(Tenant $tenant): Tenant
    {
        $tenant->update(['is_active' => !$tenant->is_active]);
        return $tenant->fresh();
    }

    /**
     * Assign a template to a tenant.
     */
    public function assignTemplate(Tenant $tenant, int $templateId): Tenant
    {
        $template = Template::findOrFail($templateId);
        $tenant->update(['active_template_id' => $template->id]);
        return $tenant->fresh(['activeTemplate']);
    }

    /**
     * Get tenant statistics.
     */
    public function getStatistics(Tenant $tenant): array
    {
        return [
            'pages' => $tenant->pages()->count(),
            'services' => $tenant->services()->count(),
            'faqs' => $tenant->faqs()->count(),
            'testimonials' => $tenant->testimonials()->count(),
            'team_members' => $tenant->teamMembers()->count(),
            'media' => $tenant->media()->count(),
            'users' => $tenant->users()->count(),
        ];
    }

    /**
     * Generate a unique slug for the tenant.
     */
    protected function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
