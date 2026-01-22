<?php

namespace App\Repositories;

use App\Models\Section;
use App\Repositories\Contracts\SectionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Section Repository Implementation
 */
class SectionRepository extends BaseRepository implements SectionRepositoryInterface
{
    /**
     * Available section types.
     *
     * @var array
     */
    protected array $sectionTypes = [
        'hero' => 'Hero Section',
        'features' => 'Features Grid',
        'services' => 'Services Section',
        'testimonials' => 'Testimonials',
        'faq' => 'FAQ Section',
        'team' => 'Team Section',
        'cta' => 'Call to Action',
        'content' => 'Rich Content',
        'gallery' => 'Image Gallery',
        'contact' => 'Contact Form',
        'stats' => 'Statistics',
        'pricing' => 'Pricing Table',
        'timeline' => 'Timeline',
        'video' => 'Video Section',
        'custom' => 'Custom HTML',
    ];

    /**
     * Create a new repository instance.
     *
     * @param Section $model
     */
    public function __construct(Section $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getByPage(int $pageId, bool $publishedOnly = false): Collection
    {
        $query = $this->query()
            ->where('page_id', $pageId)
            ->orderBy('order');

        if ($publishedOnly) {
            $query->where('is_published', true);
        }

        return $query->get();
    }

    /**
     * {@inheritDoc}
     */
    public function updateOrder(int $pageId, array $orderedIds): bool
    {
        return $this->transaction(function () use ($pageId, $orderedIds) {
            foreach ($orderedIds as $index => $id) {
                $this->query()
                    ->where('id', $id)
                    ->where('page_id', $pageId)
                    ->update(['order' => $index]);
            }
            return true;
        });
    }

    /**
     * {@inheritDoc}
     */
    public function duplicate(int $sectionId): Model
    {
        $section = $this->findById($sectionId);

        if (!$section) {
            throw new \InvalidArgumentException("Section with ID {$sectionId} not found");
        }

        $newSection = $section->replicate();
        $newSection->name = $section->name . ' (Copy)';
        $newSection->is_published = false;
        $newSection->order = $section->order + 1;
        $newSection->save();

        return $newSection;
    }

    /**
     * {@inheritDoc}
     */
    public function getAvailableTypes(): array
    {
        return $this->sectionTypes;
    }

    /**
     * Move section to another page.
     *
     * @param int $sectionId
     * @param int $newPageId
     * @return Model
     */
    public function moveToPage(int $sectionId, int $newPageId): Model
    {
        $section = $this->findById($sectionId);

        if (!$section) {
            throw new \InvalidArgumentException("Section with ID {$sectionId} not found");
        }

        $section->page_id = $newPageId;
        $section->order = $this->count(['page_id' => $newPageId]);
        $section->save();

        return $section;
    }
}
