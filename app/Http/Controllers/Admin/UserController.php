<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Tenant;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * User Controller
 * 
 * Handles HTTP requests for user management in the admin panel.
 * Uses UserService for business logic and repository pattern for data access.
 */
class UserController extends Controller
{
    /**
     * @var UserService
     */
    protected UserService $userService;

    /**
     * Create a new controller instance.
     *
     * @param UserService $userService
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Display a listing of users.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'role', 'tenant_id', 'is_active']);
        
        $users = $this->userService->getPaginated(
            perPage: 15,
            filters: $filters
        );

        $tenants = Tenant::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'tenants' => $tenants,
            'filters' => $filters,
            'roleOptions' => $this->getRoleOptions(),
        ]);
    }

    /**
     * Show the form for creating a new user.
     *
     * @return Response
     */
    public function create(): Response
    {
        $tenants = Tenant::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Users/Create', [
            'tenants' => $tenants,
            'roleOptions' => $this->getRoleOptions(),
        ]);
    }

    /**
     * Store a newly created user.
     *
     * @param StoreUserRequest $request
     * @return RedirectResponse
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = $this->userService->create($request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User '{$user->name}' has been created successfully.");
    }

    /**
     * Display the specified user.
     *
     * @param User $user
     * @return Response
     */
    public function show(User $user): Response
    {
        $user->load('tenant');

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     *
     * @param User $user
     * @return Response
     */
    public function edit(User $user): Response
    {
        $user->load('tenant');

        $tenants = Tenant::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Users/Edit', [
            'user' => new UserResource($user),
            'tenants' => $tenants,
            'roleOptions' => $this->getRoleOptions(),
        ]);
    }

    /**
     * Update the specified user.
     *
     * @param UpdateUserRequest $request
     * @param User $user
     * @return RedirectResponse
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // Check if current user can modify this user
        if (!$this->userService->canModify($user, $request->user())) {
            return back()->with('error', 'You do not have permission to modify this user.');
        }

        $this->userService->update($user, $request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User '{$user->name}' has been updated successfully.");
    }

    /**
     * Remove the specified user.
     *
     * @param Request $request
     * @param User $user
     * @return RedirectResponse
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Check if current user can delete this user
        if (!$this->userService->canDelete($user, $request->user())) {
            return back()->with('error', 'You cannot delete this user.');
        }

        $userName = $user->name;
        $this->userService->delete($user);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "User '{$userName}' has been deleted successfully.");
    }

    /**
     * Toggle user active status.
     *
     * @param Request $request
     * @param User $user
     * @return RedirectResponse
     */
    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        // Cannot toggle your own status
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot change your own active status.');
        }

        $this->userService->toggleActive($user);

        $status = $user->fresh()->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User '{$user->name}' has been {$status}.");
    }

    /**
     * Get available role options.
     *
     * @return array
     */
    protected function getRoleOptions(): array
    {
        return [
            ['value' => 'super_admin', 'label' => 'Super Admin'],
            ['value' => 'tenant_admin', 'label' => 'Tenant Admin'],
            ['value' => 'editor', 'label' => 'Editor'],
        ];
    }
}
