<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebhookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $webhooks = Webhook::query()
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Webhooks/Index', [
            'webhooks' => $webhooks,
            'availableEvents' => Webhook::EVENTS,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Webhooks/Create', [
            'availableEvents' => Webhook::EVENTS,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:1000',
            'secret' => 'nullable|string|max:255',
            'events' => 'required|array|min:1',
            'events.*' => 'string|in:' . implode(',', Webhook::EVENTS),
            'is_active' => 'boolean',
        ]);

        // Generate secret if requested
        if ($request->boolean('generate_secret')) {
            $validated['secret'] = Str::random(32);
        }

        $validated['tenant_id'] = auth()->user()->tenant_id;

        $webhook = Webhook::create($validated);

        return redirect()
            ->route('admin.webhooks.index')
            ->with('success', "Webhook '{$webhook->name}' created successfully.");
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Webhook $webhook)
    {
        return Inertia::render('Admin/Webhooks/Edit', [
            'webhook' => $webhook,
            'availableEvents' => Webhook::EVENTS,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Webhook $webhook)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:1000',
            'secret' => 'nullable|string|max:255',
            'events' => 'required|array|min:1',
            'events.*' => 'string|in:' . implode(',', Webhook::EVENTS),
            'is_active' => 'boolean',
        ]);

        // Generate new secret if requested
        if ($request->boolean('regenerate_secret')) {
            $validated['secret'] = Str::random(32);
        }

        $webhook->update($validated);

        return redirect()
            ->route('admin.webhooks.index')
            ->with('success', "Webhook '{$webhook->name}' updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Webhook $webhook)
    {
        $name = $webhook->name;
        $webhook->delete();

        return redirect()
            ->route('admin.webhooks.index')
            ->with('success', "Webhook '{$name}' deleted successfully.");
    }

    /**
     * Test a webhook by sending a test event.
     */
    public function test(Webhook $webhook)
    {
        $success = $webhook->send('test', [
            'message' => 'This is a test webhook event',
            'timestamp' => now()->toIso8601String(),
        ]);

        if ($success) {
            return back()->with('success', 'Test webhook sent successfully!');
        }

        return back()->with('error', 'Webhook test failed: ' . $webhook->last_error);
    }
}
