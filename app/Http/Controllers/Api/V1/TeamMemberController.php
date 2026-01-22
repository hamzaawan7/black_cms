<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\BaseApiController;
use App\Http\Resources\TeamMemberResource;
use App\Http\Resources\TeamMemberCollection;
use App\Services\TeamMemberService;

class TeamMemberController extends BaseApiController
{
    public function __construct(protected TeamMemberService $teamMemberService)
    {
    }

    /**
     * Get all team members.
     */
    public function index()
    {
        $teamMembers = $this->teamMemberService->getAll(['is_published' => true]);

        return $this->successResponse(
            new TeamMemberCollection($teamMembers),
            'Team members retrieved successfully'
        );
    }

    /**
     * Get a single team member by ID.
     */
    public function show(int $id)
    {
        $teamMember = $this->teamMemberService->getById($id);

        if (!$teamMember || !$teamMember->is_published) {
            return $this->notFoundResponse('Team member not found');
        }

        return $this->successResponse(
            new TeamMemberResource($teamMember),
            'Team member retrieved successfully'
        );
    }
}
