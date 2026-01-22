<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeamMember\StoreTeamMemberRequest;
use App\Http\Requests\TeamMember\UpdateTeamMemberRequest;
use App\Http\Resources\TeamMemberResource;
use App\Models\TeamMember;
use App\Services\TeamMemberService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    public function __construct(protected TeamMemberService $teamMemberService)
    {
    }

    /**
     * Display a listing of the team members.
     */
    public function index(): Response
    {
        $teamMembers = $this->teamMemberService->getPaginated(
            perPage: 15,
            filters: request()->only(['search', 'is_published'])
        );

        return Inertia::render('Admin/Team/Index', [
            'teamMembers' => $teamMembers,
            'filters' => request()->only(['search', 'is_published']),
        ]);
    }

    /**
     * Show the form for creating a new team member.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Team/Create');
    }

    /**
     * Store a newly created team member.
     */
    public function store(StoreTeamMemberRequest $request): RedirectResponse
    {
        $teamMember = $this->teamMemberService->create($request->validated());

        return redirect()
            ->route('admin.team.index')
            ->with('success', 'Team member created successfully.');
    }

    /**
     * Show the form for editing the team member.
     */
    public function edit(TeamMember $teamMember): Response
    {
        return Inertia::render('Admin/Team/Edit', [
            'teamMember' => new TeamMemberResource($teamMember),
        ]);
    }

    /**
     * Update the team member.
     */
    public function update(UpdateTeamMemberRequest $request, TeamMember $teamMember): RedirectResponse
    {
        $this->teamMemberService->update($teamMember, $request->validated());

        return redirect()
            ->route('admin.team.index')
            ->with('success', 'Team member updated successfully.');
    }

    /**
     * Remove the team member.
     */
    public function destroy(TeamMember $teamMember): RedirectResponse
    {
        $this->teamMemberService->delete($teamMember);

        return redirect()
            ->route('admin.team.index')
            ->with('success', 'Team member deleted successfully.');
    }

    /**
     * Toggle published status.
     */
    public function togglePublished(TeamMember $teamMember): RedirectResponse
    {
        $this->teamMemberService->togglePublished($teamMember);

        return back()->with('success', 'Team member updated successfully.');
    }

    /**
     * Reorder team members.
     */
    public function reorder(): RedirectResponse
    {
        $this->teamMemberService->reorder(request('orders', []));

        return back()->with('success', 'Team members reordered successfully.');
    }
}
