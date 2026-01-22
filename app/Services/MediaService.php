<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    /**
     * Get all media for the current tenant.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = Media::query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['folder'])) {
            $query->where('folder', $filters['folder']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated media.
     */
    public function getPaginated(int $perPage = 24, array $filters = []): LengthAwarePaginator
    {
        $query = Media::query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['folder'])) {
            $query->where('folder', $filters['folder']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('alt_text', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Get a media by ID.
     */
    public function getById(int $id): ?Media
    {
        return Media::find($id);
    }

    /**
     * Upload a new media file.
     */
    public function upload(UploadedFile $file, array $data = []): Media
    {
        $tenantId = auth()->user()->tenant_id;
        $folder = $data['folder'] ?? 'uploads';
        $type = $this->determineType($file);

        // Generate unique filename
        $filename = $this->generateFilename($file);

        // Store file
        $path = $file->storeAs(
            "tenants/{$tenantId}/{$folder}",
            $filename,
            'public'
        );

        // Create media record
        return Media::create([
            'original_filename' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $data['alt_text'] ?? null,
            'caption' => $data['caption'] ?? null,
            'folder' => $folder,
            'meta' => $this->extractMetadata($file, $type),
        ]);
    }

    /**
     * Create media from URL.
     */
    public function createFromUrl(string $url, array $data = []): Media
    {
        $basename = basename(parse_url($url, PHP_URL_PATH));

        return Media::create([
            'original_filename' => $data['original_filename'] ?? $basename,
            'filename' => $basename,
            'path' => null,
            'url' => $url,
            'disk' => 'external',
            'mime_type' => null,
            'size' => null,
            'alt_text' => $data['alt_text'] ?? null,
            'caption' => $data['caption'] ?? null,
            'folder' => $data['folder'] ?? 'external',
            'meta' => $data['meta'] ?? null,
        ]);
    }

    /**
     * Update media metadata.
     */
    public function update(Media $media, array $data): Media
    {
        $media->update($data);
        return $media->fresh();
    }

    /**
     * Delete a media file.
     */
    public function delete(Media $media): bool
    {
        // Delete file from storage if it exists
        if ($media->path && Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        return $media->delete();
    }

    /**
     * Get folders list.
     */
    public function getFolders(): array
    {
        return Media::select('folder')
            ->distinct()
            ->pluck('folder')
            ->toArray();
    }

    /**
     * Move media to different folder.
     */
    public function moveToFolder(Media $media, string $folder): Media
    {
        if ($media->path) {
            $tenantId = auth()->user()->tenant_id;
            $newPath = "tenants/{$tenantId}/{$folder}/{$media->filename}";

            Storage::disk('public')->move($media->path, $newPath);

            $media->update([
                'folder' => $folder,
                'path' => $newPath,
                'url' => Storage::disk('public')->url($newPath),
            ]);
        } else {
            $media->update(['folder' => $folder]);
        }

        return $media->fresh();
    }

    /**
     * Determine media type from file.
     */
    protected function determineType(UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }
        if (str_starts_with($mime, 'audio/')) {
            return 'audio';
        }

        return 'document';
    }

    /**
     * Determine media type from URL.
     */
    protected function determineTypeFromUrl(string $url): string
    {
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));

        $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $videoExts = ['mp4', 'webm', 'mov', 'avi'];
        $audioExts = ['mp3', 'wav', 'ogg'];

        if (in_array($extension, $imageExts)) {
            return 'image';
        }
        if (in_array($extension, $videoExts)) {
            return 'video';
        }
        if (in_array($extension, $audioExts)) {
            return 'audio';
        }

        return 'document';
    }

    /**
     * Generate unique filename.
     */
    protected function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Extract metadata from file.
     */
    protected function extractMetadata(UploadedFile $file, string $type): ?array
    {
        if ($type === 'image') {
            $dimensions = @getimagesize($file->getPathname());
            if ($dimensions) {
                return [
                    'width' => $dimensions[0],
                    'height' => $dimensions[1],
                ];
            }
        }

        return null;
    }
}
