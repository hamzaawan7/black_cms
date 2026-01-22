<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setting\BulkUpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\SettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function __construct(protected SettingService $settingService)
    {
    }

    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        // Get all settings as flat key-value pairs for the frontend
        $allSettings = Setting::all();
        $settings = [];
        foreach ($allSettings as $setting) {
            $settings[$setting->key] = $setting->value;
        }
        
        $groups = $this->settingService->getGroups();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'groups' => $groups,
        ]);
    }

    /**
     * Display settings for a specific group.
     */
    public function group(string $group): Response
    {
        $settings = $this->settingService->getByGroup($group);
        $groups = $this->settingService->getGroups();

        return Inertia::render('Admin/Settings/Group', [
            'settings' => SettingResource::collection($settings),
            'currentGroup' => $group,
            'groupName' => $groups[$group] ?? $group,
            'groups' => $groups,
        ]);
    }

    /**
     * Update settings.
     */
    public function update(BulkUpdateSettingsRequest $request): RedirectResponse
    {
        $this->settingService->bulkUpdate($request->validated()['settings']);

        return back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Initialize default settings.
     */
    public function initialize(): RedirectResponse
    {
        $this->settingService->initializeDefaults();

        return back()->with('success', 'Default settings initialized.');
    }
}
