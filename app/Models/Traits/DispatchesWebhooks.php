<?php

namespace App\Models\Traits;

use App\Models\Webhook;

trait DispatchesWebhooks
{
    /**
     * Boot the trait.
     */
    public static function bootDispatchesWebhooks(): void
    {
        static::created(function ($model) {
            $model->dispatchWebhookEvent('created');
        });

        static::updated(function ($model) {
            $model->dispatchWebhookEvent('updated');
            
            // Check for publish event
            if ($model->wasRecentlyPublished()) {
                $model->dispatchWebhookEvent('published');
            }
        });

        static::deleted(function ($model) {
            $model->dispatchWebhookEvent('deleted');
        });
    }

    /**
     * Get the webhook event name prefix.
     * Override in model if needed.
     */
    protected function getWebhookEventPrefix(): string
    {
        $className = class_basename(static::class);
        return strtolower($className);
    }

    /**
     * Dispatch a webhook event.
     */
    protected function dispatchWebhookEvent(string $action): void
    {
        $prefix = $this->getWebhookEventPrefix();
        $event = "{$prefix}.{$action}";

        Webhook::dispatch($event, $this->getWebhookPayload(), $this->tenant_id ?? null);
    }

    /**
     * Get the payload for webhook.
     * Override in model for custom payload.
     */
    protected function getWebhookPayload(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->getWebhookEventPrefix(),
            'tenant_id' => $this->tenant_id ?? null,
            'slug' => $this->slug ?? null,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Check if the model was recently published.
     */
    protected function wasRecentlyPublished(): bool
    {
        // Check if is_published was changed from false to true
        if ($this->isDirty('is_published') && $this->is_published) {
            return true;
        }

        // Check if publish_status was changed to 'published'
        if ($this->isDirty('publish_status') && $this->publish_status === 'published') {
            return true;
        }

        return false;
    }

    /**
     * Manually trigger cache invalidation webhook.
     */
    public function invalidateCache(): void
    {
        Webhook::dispatch('cache.invalidate', [
            'type' => $this->getWebhookEventPrefix(),
            'id' => $this->id,
            'slug' => $this->slug ?? null,
            'tenant_id' => $this->tenant_id ?? null,
        ], $this->tenant_id ?? null);
    }
}
