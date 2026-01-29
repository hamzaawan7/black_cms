<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Media\StoreMediaRequest;
use App\Http\Requests\Media\UpdateMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function __construct(protected MediaService $mediaService)
    {
    }

    /**
     * Display a listing of the media.
     */
    public function index(): Response
    {
        $media = $this->mediaService->getPaginated(
            perPage: 24,
            filters: request()->only(['search', 'type', 'folder'])
        );

        return Inertia::render('Admin/Media/Index', [
            'media' => $media,
            'filters' => request()->only(['search', 'type', 'folder']),
            'folders' => $this->mediaService->getFolders(),
        ]);
    }

    /**
     * Upload new media.
     */
    public function store(StoreMediaRequest $request): RedirectResponse|JsonResponse
    {
        try {
            if ($request->hasFile('file')) {
                $media = $this->mediaService->upload(
                    $request->file('file'),
                    $request->only(['name', 'alt_text', 'caption', 'folder', 'metadata'])
                );
            } elseif ($request->filled('url')) {
                $media = $this->mediaService->createFromUrl(
                    $request->url,
                    $request->only(['name', 'alt_text', 'caption', 'type', 'folder', 'metadata'])
                );
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Media uploaded successfully.',
                    'data' => new MediaResource($media),
                ]);
            }

            return back()->with('success', 'Media uploaded successfully.');
        } catch (\Exception $e) {
            \Log::error('Media upload failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Upload failed: ' . $e->getMessage(),
                ], 500);
            }
            
            return back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Update media metadata.
     */
    public function update(UpdateMediaRequest $request, Media $media): RedirectResponse|JsonResponse
    {
        $this->mediaService->update($media, $request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Media updated successfully.',
                'data' => new MediaResource($media->fresh()),
            ]);
        }

        return back()->with('success', 'Media updated successfully.');
    }

    /**
     * Remove the media.
     */
    public function destroy(Media $media): RedirectResponse|JsonResponse
    {
        $this->mediaService->delete($media);

        if (request()->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Media deleted successfully.',
            ]);
        }

        return back()->with('success', 'Media deleted successfully.');
    }

    /**
     * Move media to folder.
     */
    public function move(Media $media): RedirectResponse
    {
        $this->mediaService->moveToFolder($media, request('folder'));

        return back()->with('success', 'Media moved successfully.');
    }

    /**
     * Get media for picker (JSON response for AJAX).
     */
    public function picker(): JsonResponse
    {
        $media = $this->mediaService->getPaginated(
            perPage: request('per_page', 24),
            filters: request()->only(['type', 'folder', 'search'])
        );

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }
}
