<?php

namespace App\Repositories;

use App\Models\Media;
use App\Repositories\Contracts\MediaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

/**
 * Media Repository Implementation
 */
class MediaRepository extends BaseRepository implements MediaRepositoryInterface
{
    /**
     * Allowed image extensions.
     *
     * @var array
     */
    protected array $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

    /**
     * Allowed video extensions.
     *
     * @var array
     */
    protected array $videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];

    /**
     * Allowed document extensions.
     *
     * @var array
     */
    protected array $documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

    /**
     * Create a new repository instance.
     *
     * @param Media $model
     */
    public function __construct(Media $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function upload(UploadedFile $file, string $folder = 'uploads', array $metadata = []): Model
    {
        $originalName = $file->getClientOriginalName();
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = Str::uuid() . '.' . $extension;
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Determine media type
        $type = $this->determineMediaType($extension);

        // Store file
        $path = $file->storeAs($folder, $filename, 'public');

        // Create media record
        $media = $this->create([
            'filename' => $filename,
            'original_filename' => $originalName,
            'path' => $path,
            'url' => Storage::url($path),
            'mime_type' => $mimeType,
            'size' => $size,
            'type' => $type,
            'folder' => $folder,
            'alt_text' => $metadata['alt_text'] ?? pathinfo($originalName, PATHINFO_FILENAME),
            'title' => $metadata['title'] ?? pathinfo($originalName, PATHINFO_FILENAME),
            'description' => $metadata['description'] ?? null,
            'metadata' => $metadata['metadata'] ?? null,
        ]);

        // Generate thumbnail for images
        if ($type === 'image' && !in_array($extension, ['svg', 'gif'])) {
            $this->generateThumbnail($media->id);
        }

        return $media;
    }

    /**
     * {@inheritDoc}
     */
    public function uploadMultiple(array $files, string $folder = 'uploads'): Collection
    {
        $uploaded = collect();

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploaded->push($this->upload($file, $folder));
            }
        }

        return $uploaded;
    }

    /**
     * {@inheritDoc}
     */
    public function getByType(string $type): Collection
    {
        return $this->query()
            ->where('type', $type)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByFolder(string $folder): Collection
    {
        return $this->query()
            ->where('folder', $folder)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function deleteWithFile(int $mediaId): bool
    {
        $media = $this->findById($mediaId);

        if (!$media) {
            return false;
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Delete thumbnail if exists
        if ($media->thumbnail_path && Storage::disk('public')->exists($media->thumbnail_path)) {
            Storage::disk('public')->delete($media->thumbnail_path);
        }

        return $this->deleteById($mediaId);
    }

    /**
     * {@inheritDoc}
     */
    public function getStorageStats(): array
    {
        $stats = $this->query()
            ->selectRaw('type, COUNT(*) as count, SUM(size) as total_size')
            ->groupBy('type')
            ->get();

        $totalSize = $this->query()->sum('size');
        $totalCount = $this->query()->count();

        return [
            'total_files' => $totalCount,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'by_type' => $stats->mapWithKeys(function ($item) {
                return [$item->type => [
                    'count' => $item->count,
                    'size' => $item->total_size,
                    'size_formatted' => $this->formatBytes($item->total_size),
                ]];
            })->toArray(),
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function generateThumbnail(int $mediaId, int $width = 150, int $height = 150): ?string
    {
        $media = $this->findById($mediaId);

        if (!$media || $media->type !== 'image') {
            return null;
        }

        try {
            $sourcePath = Storage::disk('public')->path($media->path);
            $thumbnailFilename = 'thumb_' . $media->filename;
            $thumbnailPath = $media->folder . '/thumbnails/' . $thumbnailFilename;

            // Ensure thumbnail directory exists
            Storage::disk('public')->makeDirectory($media->folder . '/thumbnails');

            // Generate thumbnail using Intervention Image (if available)
            if (class_exists('Intervention\Image\Laravel\Facades\Image')) {
                $image = Image::read($sourcePath);
                $image->cover($width, $height);
                $image->save(Storage::disk('public')->path($thumbnailPath));

                // Update media record
                $media->thumbnail_path = $thumbnailPath;
                $media->thumbnail_url = Storage::url($thumbnailPath);
                $media->save();

                return $media->thumbnail_url;
            }

            return null;
        } catch (\Exception $e) {
            report($e);
            return null;
        }
    }

    /**
     * Determine media type from extension.
     *
     * @param string $extension
     * @return string
     */
    protected function determineMediaType(string $extension): string
    {
        if (in_array($extension, $this->imageExtensions)) {
            return 'image';
        }

        if (in_array($extension, $this->videoExtensions)) {
            return 'video';
        }

        if (in_array($extension, $this->documentExtensions)) {
            return 'document';
        }

        return 'other';
    }

    /**
     * Format bytes to human readable format.
     *
     * @param int $bytes
     * @return string
     */
    protected function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Get media with filtering and search.
     *
     * @param array $filters
     * @param string|null $search
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getFiltered(array $filters = [], ?string $search = null, int $perPage = 24)
    {
        $query = $this->query();

        $query = $this->applyFilters($query, $filters);

        if ($search) {
            $query = $this->applySearch($query, $search, ['filename', 'original_filename', 'alt_text', 'title']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
