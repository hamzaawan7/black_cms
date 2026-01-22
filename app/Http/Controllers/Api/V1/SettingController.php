<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\SettingResource;
use App\Services\SettingService;

class SettingController extends BaseApiController
{
    public function __construct(protected SettingService $settingService)
    {
    }

    /**
     * Get all settings as key-value pairs.
     */
    public function index()
    {
        $settings = $this->settingService->getAllAsArray();

        return $this->successResponse(
            $settings,
            'Settings retrieved successfully'
        );
    }

    /**
     * Get settings by group.
     */
    public function byGroup(string $group)
    {
        $settings = $this->settingService->getByGroup($group);

        return $this->successResponse(
            SettingResource::collection($settings),
            'Settings retrieved successfully'
        );
    }

    /**
     * Get a single setting by key.
     */
    public function show(string $key)
    {
        $value = $this->settingService->get($key);

        if ($value === null) {
            return $this->notFoundResponse('Setting not found');
        }

        return $this->successResponse(
            ['key' => $key, 'value' => $value],
            'Setting retrieved successfully'
        );
    }
}
