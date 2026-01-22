<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Webhook extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'url',
        'secret',
        'events',
        'is_active',
        'last_triggered_at',
        'last_status',
        'last_error',
    ];

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
        'last_triggered_at' => 'datetime',
    ];

    /**
     * Available webhook events.
     */
    public const EVENTS = [
        'page.created',
        'page.updated',
        'page.deleted',
        'page.published',
        'service.created',
        'service.updated',
        'service.deleted',
        'section.created',
        'section.updated',
        'section.deleted',
        'cache.invalidate',
    ];

    /**
     * Dispatch an event to all active webhooks.
     */
    public static function dispatch(string $event, array $payload = [], ?int $tenantId = null): void
    {
        $webhooks = static::where('is_active', true)
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->get();

        foreach ($webhooks as $webhook) {
            if ($webhook->shouldTriggerFor($event)) {
                dispatch(fn() => $webhook->send($event, $payload))->afterResponse();
            }
        }
    }

    /**
     * Check if this webhook should trigger for the given event.
     */
    public function shouldTriggerFor(string $event): bool
    {
        return in_array($event, $this->events ?? []);
    }

    /**
     * Send the webhook request.
     */
    public function send(string $event, array $payload = []): bool
    {
        try {
            $body = [
                'event' => $event,
                'timestamp' => now()->toIso8601String(),
                'webhook_id' => $this->id,
                'payload' => $payload,
            ];

            $headers = [
                'Content-Type' => 'application/json',
                'X-Webhook-Event' => $event,
                'X-Webhook-Id' => (string) $this->id,
            ];

            // Add signature if secret is set
            if ($this->secret) {
                $signature = hash_hmac('sha256', json_encode($body), $this->secret);
                $headers['X-Webhook-Signature'] = $signature;
            }

            $response = Http::timeout(10)
                ->withHeaders($headers)
                ->post($this->url, $body);

            $success = $response->successful();

            $this->update([
                'last_triggered_at' => now(),
                'last_status' => $success ? 'success' : 'failed',
                'last_error' => $success ? null : "HTTP {$response->status()}: " . Str::limit($response->body(), 500),
            ]);

            if (!$success) {
                Log::warning("Webhook failed: {$this->name}", [
                    'webhook_id' => $this->id,
                    'url' => $this->url,
                    'event' => $event,
                    'status' => $response->status(),
                ]);
            }

            return $success;
        } catch (\Exception $e) {
            $this->update([
                'last_triggered_at' => now(),
                'last_status' => 'failed',
                'last_error' => $e->getMessage(),
            ]);

            Log::error("Webhook exception: {$this->name}", [
                'webhook_id' => $this->id,
                'url' => $this->url,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
