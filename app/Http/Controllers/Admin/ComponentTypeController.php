<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComponentType;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ComponentTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Use withoutGlobalScope to show all component types including system ones (tenant_id = null)
        $componentTypes = ComponentType::withoutGlobalScope('tenant')
            ->where(function ($query) {
                $query->whereNull('tenant_id'); // System/global types
                if (auth()->user()->tenant_id) {
                    $query->orWhere('tenant_id', auth()->user()->tenant_id); // Tenant-specific
                }
            })
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/ComponentTypes/Index', [
            'componentTypes' => $componentTypes,
            'fieldTypes' => ComponentType::FIELD_TYPES,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/ComponentTypes/Create', [
            'fieldTypes' => ComponentType::FIELD_TYPES,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:component_types,slug|regex:/^[a-z][a-z0-9_]*$/',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string|max:50|regex:/^[a-z][a-z0-9_]*$/',
            'fields.*.label' => 'required|string|max:100',
            'fields.*.type' => 'required|string|in:' . implode(',', array_keys(ComponentType::FIELD_TYPES)),
            'fields.*.required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string|max:200',
            'fields.*.default' => 'nullable',
            'fields.*.options' => 'nullable|array',
            'default_content' => 'nullable|array',
            'default_styles' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['is_system'] = false; // User-created types are not system types

        ComponentType::create($validated);

        return redirect()
            ->route('admin.component-types.index')
            ->with('success', "Component type '{$validated['name']}' created successfully.");
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id): Response
    {
        $componentType = ComponentType::withoutGlobalScope('tenant')->findOrFail($id);
        
        return Inertia::render('Admin/ComponentTypes/Edit', [
            'componentType' => $componentType,
            'fieldTypes' => ComponentType::FIELD_TYPES,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $componentType = ComponentType::withoutGlobalScope('tenant')->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z][a-z0-9_]*$/', Rule::unique('component_types')->ignore($componentType->id)],
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'fields' => 'required|array|min:1',
            'fields.*.name' => 'required|string|max:50|regex:/^[a-z][a-z0-9_]*$/',
            'fields.*.label' => 'required|string|max:100',
            'fields.*.type' => 'required|string|in:' . implode(',', array_keys(ComponentType::FIELD_TYPES)),
            'fields.*.required' => 'boolean',
            'fields.*.placeholder' => 'nullable|string|max:200',
            'fields.*.default' => 'nullable',
            'fields.*.options' => 'nullable|array',
            'default_content' => 'nullable|array',
            'default_styles' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $componentType->update($validated);

        return redirect()
            ->route('admin.component-types.index')
            ->with('success', "Component type '{$componentType->name}' updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $componentType = ComponentType::withoutGlobalScope('tenant')->findOrFail($id);
        
        if ($componentType->is_system) {
            return back()->with('error', 'System component types cannot be deleted.');
        }

        $name = $componentType->name;
        $componentType->delete();

        return redirect()
            ->route('admin.component-types.index')
            ->with('success', "Component type '{$name}' deleted successfully.");
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(int $id): RedirectResponse
    {
        $componentType = ComponentType::withoutGlobalScope('tenant')->findOrFail($id);
        
        $componentType->update(['is_active' => !$componentType->is_active]);

        $status = $componentType->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Component type '{$componentType->name}' {$status}.");
    }
}
