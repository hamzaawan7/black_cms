<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

/**
 * Media Repository Interface
 */
interface MediaRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Upload file and create media record.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param array $metadata
     * @return \Illuminate\Database\Eloquent\Model
     */
    public function upload(UploadedFile $file, string $folder = 'uploads', array $metadata = []);

    /**
     * Upload multiple files.
     *
     * @param array $files
     * @param string $folder
     * @return Collection
     */
    public function uploadMultiple(array $files, string $folder = 'uploads'): Collection;

    /**
     * Get media by type (image, video, document).
     *
     * @param string $type
     * @return Collection
     */
    public function getByType(string $type): Collection;

    /**
     * Get media by folder.
     *
     * @param string $folder
     * @return Collection
     */
    public function getByFolder(string $folder): Collection;

    /**
     * Delete media file and record.
     *
     * @param int $mediaId
     * @return bool
     */
    public function deleteWithFile(int $mediaId): bool;

    /**
     * Get storage usage stats.
     *
     * @return array
     */
    public function getStorageStats(): array;

    /**
     * Generate thumbnail for image.
     *
     * @param int $mediaId
     * @param int $width
     * @param int $height
     * @return string|null
     */
    public function generateThumbnail(int $mediaId, int $width = 150, int $height = 150): ?string;
}
