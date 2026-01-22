<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends BaseApiController
{
    public function __construct(protected WebhookService $webhookService)
    {
    }

    /**
     * Clear cache for a specific resource type.
     */
    public function clearCache(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:pages,services,settings,menus,team,faqs,testimonials,all',
            'slug' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        $tenantId = $tenant ? $tenant->id : null;

        $cleared = $this->webhookService->clearCache(
            $request->type,
            $tenantId,
            $request->slug
        );

        return $this->successResponse([
            'type' => $request->type,
            'slug' => $request->slug,
            'cleared' => $cleared,
        ], 'Cache cleared successfully');
    }

    /**
     * Trigger revalidation of frontend pages.
     */
    public function revalidate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'paths' => 'required|array',
            'paths.*' => 'string',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        $results = $this->webhookService->revalidateFrontend($tenant, $request->paths);

        return $this->successResponse($results, 'Revalidation triggered');
    }

    /**
     * Notify of content change (triggers cache clear + revalidation).
     */
    public function contentChanged(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'resource_type' => 'required|string',
            'resource_id' => 'nullable|integer',
            'resource_slug' => 'nullable|string',
            'action' => 'required|string|in:created,updated,deleted',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        $result = $this->webhookService->handleContentChange(
            $tenant,
            $request->resource_type,
            $request->resource_id,
            $request->resource_slug,
            $request->action
        );

        return $this->successResponse($result, 'Content change processed');
    }

    /**
     * Register a webhook endpoint.
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'events' => 'required|array',
            'events.*' => 'string|in:page.updated,page.created,page.deleted,service.updated,setting.updated,cache.cleared',
            'secret' => 'nullable|string|min:16',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $tenant = request()->attributes->get('tenant');
        $webhook = $this->webhookService->registerWebhook(
            $tenant,
            $request->url,
            $request->events,
            $request->secret
        );

        return $this->successResponse($webhook, 'Webhook registered successfully', 201);
    }

    /**
     * List registered webhooks for the tenant.
     */
    public function list(): JsonResponse
    {
        $tenant = request()->attributes->get('tenant');
        $webhooks = $this->webhookService->getWebhooks($tenant);

        return $this->successResponse($webhooks, 'Webhooks retrieved');
    }

    /**
     * Delete a webhook.
     */
    public function delete(int $id): JsonResponse
    {
        $tenant = request()->attributes->get('tenant');
        $deleted = $this->webhookService->deleteWebhook($tenant, $id);

        if (!$deleted) {
            return $this->notFoundResponse('Webhook not found');
        }

        return $this->successResponse(null, 'Webhook deleted successfully');
    }

    /**
     * Get cache statistics.
     */
    public function cacheStats(): JsonResponse
    {
        $tenant = request()->attributes->get('tenant');
        $stats = $this->webhookService->getCacheStats($tenant);

        return $this->successResponse($stats, 'Cache statistics retrieved');
    }

    /**
     * Health check for webhook system.
     */
    public function health(): JsonResponse
    {
        return $this->successResponse([
            'status' => 'healthy',
            'cache_driver' => config('cache.default'),
            'timestamp' => now()->toIso8601String(),
        ], 'Webhook system healthy');
    }
}
