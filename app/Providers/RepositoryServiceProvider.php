<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Contracts
use App\Repositories\Contracts\BaseRepositoryInterface;
use App\Repositories\Contracts\ServiceRepositoryInterface;
use App\Repositories\Contracts\ServiceCategoryRepositoryInterface;
use App\Repositories\Contracts\PageRepositoryInterface;
use App\Repositories\Contracts\SectionRepositoryInterface;
use App\Repositories\Contracts\MediaRepositoryInterface;
use App\Repositories\Contracts\FaqRepositoryInterface;
use App\Repositories\Contracts\TestimonialRepositoryInterface;
use App\Repositories\Contracts\TeamMemberRepositoryInterface;
use App\Repositories\Contracts\MenuRepositoryInterface;
use App\Repositories\Contracts\SettingRepositoryInterface;
use App\Repositories\Contracts\TenantRepositoryInterface;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;

// Repositories
use App\Repositories\ServiceRepository;
use App\Repositories\ServiceCategoryRepository;
use App\Repositories\PageRepository;
use App\Repositories\SectionRepository;
use App\Repositories\MediaRepository;
use App\Repositories\FaqRepository;
use App\Repositories\TestimonialRepository;
use App\Repositories\TeamMemberRepository;
use App\Repositories\MenuRepository;
use App\Repositories\SettingRepository;
use App\Repositories\TenantRepository;
use App\Repositories\TemplateRepository;
use App\Repositories\UserRepository;

/**
 * Repository Service Provider
 *
 * Binds repository interfaces to their concrete implementations.
 * This enables dependency injection and makes testing easier.
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Repository bindings.
     *
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        ServiceRepositoryInterface::class => ServiceRepository::class,
        ServiceCategoryRepositoryInterface::class => ServiceCategoryRepository::class,
        PageRepositoryInterface::class => PageRepository::class,
        SectionRepositoryInterface::class => SectionRepository::class,
        MediaRepositoryInterface::class => MediaRepository::class,
        FaqRepositoryInterface::class => FaqRepository::class,
        TestimonialRepositoryInterface::class => TestimonialRepository::class,
        TeamMemberRepositoryInterface::class => TeamMemberRepository::class,
        MenuRepositoryInterface::class => MenuRepository::class,
        SettingRepositoryInterface::class => SettingRepository::class,
        TenantRepositoryInterface::class => TenantRepository::class,
        TemplateRepositoryInterface::class => TemplateRepository::class,
        UserRepositoryInterface::class => UserRepository::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        foreach ($this->repositories as $interface => $repository) {
            $this->app->bind($interface, $repository);
        }
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
