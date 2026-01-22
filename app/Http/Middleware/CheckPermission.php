<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Permission definitions by role.
     */
    protected array $rolePermissions = [
        'super_admin' => ['*'], // All permissions
        'tenant_admin' => [
            'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
            'services.view', 'services.create', 'services.edit', 'services.delete',
            'media.view', 'media.upload', 'media.delete',
            'testimonials.view', 'testimonials.create', 'testimonials.edit', 'testimonials.delete',
            'faqs.view', 'faqs.create', 'faqs.edit', 'faqs.delete',
            'team.view', 'team.create', 'team.edit', 'team.delete',
            'menus.view', 'menus.create', 'menus.edit', 'menus.delete',
            'settings.view', 'settings.edit',
            'users.view', 'users.invite', 'users.remove',
        ],
        'editor' => [
            'pages.view', 'pages.create', 'pages.edit',
            'services.view', 'services.create', 'services.edit',
            'media.view', 'media.upload',
            'testimonials.view', 'testimonials.create', 'testimonials.edit',
            'faqs.view', 'faqs.create', 'faqs.edit',
            'team.view', 'team.create', 'team.edit',
            'menus.view', 'menus.edit',
            'settings.view',
        ],
        'viewer' => [
            'pages.view',
            'services.view',
            'media.view',
            'testimonials.view',
            'faqs.view',
            'team.view',
            'menus.view',
            'settings.view',
        ],
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($this->hasPermission($user, $permission)) {
            return $next($request);
        }

        // For Inertia requests, return a proper error response
        if ($request->header('X-Inertia')) {
            return inertia('Errors/Forbidden', [
                'message' => 'You do not have permission to perform this action.',
            ])->toResponse($request)->setStatusCode(403);
        }

        abort(403, 'You do not have permission to perform this action.');
    }

    /**
     * Check if user has the specified permission.
     */
    protected function hasPermission($user, string $permission): bool
    {
        $role = $user->role ?? 'viewer';
        $permissions = $this->rolePermissions[$role] ?? [];

        // Check for wildcard permission (super_admin)
        if (in_array('*', $permissions)) {
            return true;
        }

        return in_array($permission, $permissions);
    }
}
