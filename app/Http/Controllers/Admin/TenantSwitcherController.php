<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantSwitcherController extends Controller
{
    /**
     * Get all tenants (super_admin only).
     */
    public function index(): JsonResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $tenants = Tenant::orderBy('name')->get(['id', 'name', 'slug', 'domain', 'is_active']);
        $activeTenantId = auth()->user()->getActiveTenantId();

        return response()->json([
            'success' => true,
            'data' => [
                'tenants' => $tenants,
                'active_tenant_id' => $activeTenantId,
            ],
        ]);
    }

    /**
     * Switch to a different tenant (super_admin only).
     */
    public function switch(Request $request): JsonResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'tenant_id' => 'required|integer|exists:tenants,id',
        ]);

        $tenant = Tenant::find($request->tenant_id);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 404);
        }

        auth()->user()->switchTenant($tenant->id);

        return response()->json([
            'success' => true,
            'message' => "Switched to {$tenant->name}",
            'data' => [
                'tenant' => $tenant,
            ],
        ]);
    }

    /**
     * Reset to own tenant.
     */
    public function reset(): JsonResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        auth()->user()->resetTenant();
        $tenant = auth()->user()->tenant;

        return response()->json([
            'success' => true,
            'message' => 'Reset to your default tenant',
            'data' => [
                'tenant' => $tenant,
            ],
        ]);
    }

    /**
     * Get current active tenant info.
     */
    public function current(): JsonResponse
    {
        $tenant = auth()->user()->getActiveTenant();

        return response()->json([
            'success' => true,
            'data' => [
                'tenant' => $tenant,
                'is_switched' => auth()->user()->isSuperAdmin() && session()->has('active_tenant_id'),
            ],
        ]);
    }
}
