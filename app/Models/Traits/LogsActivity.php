<?php

namespace App\Models\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    /**
     * Boot the trait.
     */
    public static function bootLogsActivity(): void
    {
        // Log when model is created
        static::created(function ($model) {
            ActivityLog::log('created', $model, [
                'new' => $model->getActivityLogAttributes(),
            ]);
        });

        // Log when model is updated
        static::updated(function ($model) {
            $changes = $model->getChangedAttributes();
            
            if (!empty($changes)) {
                ActivityLog::log('updated', $model, [
                    'old' => $changes['old'],
                    'new' => $changes['new'],
                ]);
            }
        });

        // Log when model is deleted
        static::deleted(function ($model) {
            ActivityLog::log('deleted', $model, [
                'old' => $model->getActivityLogAttributes(),
            ]);
        });
    }

    /**
     * Get attributes to log.
     */
    public function getActivityLogAttributes(): array
    {
        // Get attributes to log (exclude sensitive data)
        $attributes = $this->toArray();
        
        $hidden = $this->activityLogHidden ?? ['password', 'remember_token'];
        
        return collect($attributes)
            ->except($hidden)
            ->toArray();
    }

    /**
     * Get changed attributes for logging.
     */
    public function getChangedAttributes(): array
    {
        $changes = $this->getChanges();
        $original = $this->getOriginal();
        
        $hidden = $this->activityLogHidden ?? ['password', 'remember_token', 'updated_at'];
        
        $old = [];
        $new = [];
        
        foreach ($changes as $key => $value) {
            if (in_array($key, $hidden)) {
                continue;
            }
            
            $old[$key] = $original[$key] ?? null;
            $new[$key] = $value;
        }
        
        return ['old' => $old, 'new' => $new];
    }

    /**
     * Log a custom activity for this model.
     */
    public function logActivity(string $action, ?array $properties = null): ActivityLog
    {
        return ActivityLog::log($action, $this, $properties);
    }
}
