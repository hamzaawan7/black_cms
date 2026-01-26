<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Template;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TenantDeploymentService
{
    protected NginxConfigService $nginxService;

    public function __construct(NginxConfigService $nginxService)
    {
        $this->nginxService = $nginxService;
    }

    /**
     * Deploy a template for a tenant
     */
    public function deployTemplate(Tenant $tenant, Template $template): array
    {
        try {
            // Update tenant deployment status
            $tenant->update(['deployment_status' => 'deploying']);

            // Step 1: Generate API key if not exists
            if (!$tenant->api_key) {
                $tenant->regenerateApiKey();
            }

            // Step 2: Get template configuration
            $templateConfig = $template->getConfig();
            $buildConfig = $template->getBuildConfig();

            // Step 3: Prepare deployment directory
            $deploymentPath = $this->getDeploymentPath($tenant);

            // Step 4: Apply tenant-specific configuration
            $tenantConfig = $this->prepareTenantConfig($tenant, $template);

            // Step 5: Generate NGINX configuration for all tenant domains
            $nginxResults = $this->generateNginxConfigs($tenant, $deploymentPath);

            // Step 6: Update tenant status
            $tenant->update([
                'deployment_status' => 'deployed',
                'deployed_at' => now(),
            ]);

            Log::info("Template deployed successfully for tenant: {$tenant->name}", [
                'tenant_id' => $tenant->id,
                'template_id' => $template->id,
                'deployment_path' => $deploymentPath,
            ]);

            return [
                'success' => true,
                'message' => 'Template deployed successfully',
                'deployment_path' => $deploymentPath,
                'nginx_configs' => $nginxResults,
                'tenant_config' => $tenantConfig,
            ];

        } catch (\Exception $e) {
            $tenant->update(['deployment_status' => 'failed']);

            Log::error("Template deployment failed for tenant: {$tenant->name}", [
                'tenant_id' => $tenant->id,
                'template_id' => $template->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Deployment failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get the deployment path for a tenant
     */
    public function getDeploymentPath(Tenant $tenant): string
    {
        $basePath = config('app.deployment_base_path', '/var/www/templates');
        return "{$basePath}/{$tenant->slug}";
    }

    /**
     * Prepare tenant-specific configuration for the template
     */
    protected function prepareTenantConfig(Tenant $tenant, Template $template): array
    {
        return [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $tenant->domain,
            ],
            'api' => [
                'base_url' => $tenant->api_base_url ?: config('app.url') . '/api/v1',
                'key' => $tenant->api_key,
            ],
            'branding' => [
                'primary_color' => $tenant->primary_color ?: $template->default_colors['primary'] ?? '#c9a962',
                'secondary_color' => $tenant->secondary_color ?: $template->default_colors['secondary'] ?? '#3d3d3d',
                'background_color' => $tenant->background_color ?: $template->default_colors['background'] ?? '#f5f2eb',
            ],
            'seo' => [
                'meta_title' => $tenant->meta_title,
                'meta_description' => $tenant->meta_description,
            ],
            'contact' => [
                'email' => $tenant->contact_email,
                'phone' => $tenant->contact_phone,
                'address' => $tenant->contact_address,
            ],
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'version' => $template->version,
            ],
        ];
    }

    /**
     * Generate NGINX configurations for all tenant domains
     */
    protected function generateNginxConfigs(Tenant $tenant, string $deploymentPath): array
    {
        $results = [];
        $domains = $tenant->getAllDomains();

        foreach ($domains as $domain) {
            $result = $this->nginxService->generateConfig($tenant, $domain, $deploymentPath);
            $results[$domain] = $result;
        }

        return $results;
    }

    /**
     * Redeploy a tenant's template (for updates)
     */
    public function redeployTemplate(Tenant $tenant): array
    {
        if (!$tenant->template) {
            return [
                'success' => false,
                'message' => 'No template assigned to tenant',
            ];
        }

        return $this->deployTemplate($tenant, $tenant->template);
    }

    /**
     * Add a new domain to an existing tenant deployment
     */
    public function addDomain(Tenant $tenant, string $domain): array
    {
        try {
            // Add domain to tenant's additional domains
            $additionalDomains = $tenant->additional_domains ?? [];
            if (!in_array($domain, $additionalDomains)) {
                $additionalDomains[] = $domain;
                $tenant->update(['additional_domains' => $additionalDomains]);
            }

            // Generate NGINX config for the new domain
            $deploymentPath = $this->getDeploymentPath($tenant);
            $result = $this->nginxService->generateConfig($tenant, $domain, $deploymentPath);

            return [
                'success' => true,
                'message' => "Domain {$domain} added successfully",
                'nginx_config' => $result,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to add domain: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Remove a domain from a tenant deployment
     */
    public function removeDomain(Tenant $tenant, string $domain): array
    {
        try {
            // Cannot remove primary domain
            if ($domain === $tenant->domain) {
                return [
                    'success' => false,
                    'message' => 'Cannot remove primary domain',
                ];
            }

            // Remove from additional domains
            $additionalDomains = $tenant->additional_domains ?? [];
            $additionalDomains = array_filter($additionalDomains, fn($d) => $d !== $domain);
            $tenant->update(['additional_domains' => array_values($additionalDomains)]);

            // Remove NGINX config
            $this->nginxService->removeConfig($domain);

            return [
                'success' => true,
                'message' => "Domain {$domain} removed successfully",
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to remove domain: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Undeploy a tenant's template
     */
    public function undeployTemplate(Tenant $tenant): array
    {
        try {
            // Remove all NGINX configs
            $domains = $tenant->getAllDomains();
            foreach ($domains as $domain) {
                $this->nginxService->removeConfig($domain);
            }

            // Update tenant status
            $tenant->update([
                'deployment_status' => 'pending',
                'deployed_at' => null,
            ]);

            return [
                'success' => true,
                'message' => 'Template undeployed successfully',
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to undeploy: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get deployment status for a tenant
     */
    public function getDeploymentStatus(Tenant $tenant): array
    {
        return [
            'status' => $tenant->deployment_status ?? 'pending',
            'deployed_at' => $tenant->deployed_at?->toISOString(),
            'template' => $tenant->template ? [
                'id' => $tenant->template->id,
                'name' => $tenant->template->name,
                'version' => $tenant->template->version,
            ] : null,
            'domains' => $tenant->getAllDomains(),
            'deployment_path' => $this->getDeploymentPath($tenant),
        ];
    }
}
