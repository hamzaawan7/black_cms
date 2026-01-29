<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Submit a contact form
     */
    public function submit(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'required|string|max:5000',
            'subject' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->attributes->get('tenant_id');

        if (!$tenantId) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 400);
        }

        try {
            $submission = ContactSubmission::create([
                'tenant_id' => $tenantId,
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'phone' => $request->input('phone'),
                'message' => $request->input('message'),
                'subject' => $request->input('subject'),
                'source' => 'contact_form',
                'status' => 'new',
            ]);

            // Log the submission
            Log::info('Contact form submitted', [
                'tenant_id' => $tenantId,
                'submission_id' => $submission->id,
                'email' => $submission->email,
            ]);

            // TODO: Send notification email to tenant admin
            // $this->sendNotificationEmail($submission);

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully. We will get back to you soon!',
                'data' => [
                    'id' => $submission->id,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit your message. Please try again later.',
            ], 500);
        }
    }

    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid email address',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->attributes->get('tenant_id');

        if (!$tenantId) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found',
            ], 400);
        }

        try {
            // Check if already subscribed
            $existing = ContactSubmission::where('tenant_id', $tenantId)
                ->where('email', $request->input('email'))
                ->where('source', 'newsletter')
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => true,
                    'message' => 'You are already subscribed to our newsletter!',
                ], 200);
            }

            $submission = ContactSubmission::create([
                'tenant_id' => $tenantId,
                'name' => $request->input('name', 'Newsletter Subscriber'),
                'email' => $request->input('email'),
                'message' => 'Newsletter subscription',
                'source' => 'newsletter',
                'status' => 'new',
            ]);

            Log::info('Newsletter subscription', [
                'tenant_id' => $tenantId,
                'email' => $submission->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for subscribing to our newsletter!',
            ], 201);

        } catch (\Exception $e) {
            Log::error('Newsletter subscription failed', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe. Please try again later.',
            ], 500);
        }
    }

    /**
     * Get all submissions for admin (authenticated)
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        
        $query = ContactSubmission::forTenant($tenantId)
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by source
        if ($request->has('source')) {
            $query->where('source', $request->input('source'));
        }

        $submissions = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $submissions,
        ]);
    }

    /**
     * Get single submission
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        
        $submission = ContactSubmission::forTenant($tenantId)->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        // Mark as read if new
        if ($submission->status === 'new') {
            $submission->markAsRead();
        }

        return response()->json([
            'success' => true,
            'data' => $submission,
        ]);
    }

    /**
     * Update submission status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,read,replied,archived',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->attributes->get('tenant_id');
        $submission = ContactSubmission::forTenant($tenantId)->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $data = ['status' => $request->input('status')];
        
        if ($request->has('notes')) {
            $data['notes'] = $request->input('notes');
        }

        if ($request->input('status') === 'read' && !$submission->read_at) {
            $data['read_at'] = now();
        }

        if ($request->input('status') === 'replied' && !$submission->replied_at) {
            $data['replied_at'] = now();
        }

        $submission->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => $submission->fresh(),
        ]);
    }

    /**
     * Delete submission
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        $submission = ContactSubmission::forTenant($tenantId)->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found',
            ], 404);
        }

        $submission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Submission deleted successfully',
        ]);
    }

    /**
     * Get unread count for dashboard
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $tenantId = $request->attributes->get('tenant_id');
        
        $count = ContactSubmission::forTenant($tenantId)
            ->where('status', 'new')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }
}
