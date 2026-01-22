<?php

namespace App\Repositories;

use App\Models\Tenant;
use App\Models\Service;
use App\Models\Page;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\TeamMember;
use App\Repositories\Contracts\TenantRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Tenant Repository Implementation
 */
class TenantRepository extends BaseRepository implements TenantRepositoryInterface
{
    /**
     * Create a new repository instance.
     *
     * @param Tenant $model
     */
    public function __construct(Tenant $model)
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
            ->with(['activeTemplate'])
            ->orderBy('name')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function findByDomain(string $domain): ?Model
    {
        return $this->query()
            ->where('domain', $domain)
            ->where('is_active', true)
            ->with(['activeTemplate'])
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function getWithTemplate(int $tenantId): ?Model
    {
        return $this->query()
            ->where('id', $tenantId)
            ->with(['activeTemplate'])
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function getStatistics(int $tenantId): array
    {
        return [
            'services' => Service::where('tenant_id', $tenantId)->count(),
            'published_services' => Service::where('tenant_id', $tenantId)->where('is_published', true)->count(),
            'pages' => Page::where('tenant_id', $tenantId)->count(),
            'published_pages' => Page::where('tenant_id', $tenantId)->where('is_published', true)->count(),
            'faqs' => Faq::where('tenant_id', $tenantId)->count(),
            'testimonials' => Testimonial::where('tenant_id', $tenantId)->count(),
            'team_members' => TeamMember::where('tenant_id', $tenantId)->count(),
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function toggleActive(int $tenantId): bool
    {
        $tenant = $this->findById($tenantId);

        if (!$tenant) {
            return false;
        }

        $tenant->is_active = !$tenant->is_active;
        return $tenant->save();
    }

    /**
     * Get tenants with filtering.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 15): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = $this->query()->with(['activeTemplate']);

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['name', 'slug', 'domain']);
        }

        return $query->orderBy('name')->paginate($perPage);
    }
}
