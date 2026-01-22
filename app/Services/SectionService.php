<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Page;
use App\Models\ComponentType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SectionService
{
    /**
     * Get all sections for a page.
     */
    public function getByPage(int $pageId): Collection
    {
        return Section::where('page_id', $pageId)
            ->orderBy('order')
            ->get();
    }

    /**
     * Get a section by ID.
     */
    public function getById(int $id): ?Section
    {
        return Section::with('page')->find($id);
    }

    /**
     * Create a new section.
     */
    public function create(array $data): Section
    {
        // Set order to last position if not provided
        if (!isset($data['order'])) {
            $maxOrder = Section::where('page_id', $data['page_id'])->max('order');
            $data['order'] = ($maxOrder ?? -1) + 1;
        }

        return Section::create($data);
    }

    /**
     * Update a section.
     */
    public function update(Section $section, array $data): Section
    {
        $section->update($data);
        return $section->fresh();
    }

    /**
     * Delete a section.
     */
    public function delete(Section $section): bool
    {
        return DB::transaction(function () use ($section) {
            $pageId = $section->page_id;
            $deletedOrder = $section->order;

            $section->delete();

            // Reorder remaining sections
            Section::where('page_id', $pageId)
                ->where('order', '>', $deletedOrder)
                ->decrement('order');

            return true;
        });
    }

    /**
     * Reorder sections for a page.
     */
    public function reorder(array $sectionOrders): bool
    {
        return DB::transaction(function () use ($sectionOrders) {
            foreach ($sectionOrders as $item) {
                Section::where('id', $item['id'])->update(['order' => $item['order']]);
            }
            return true;
        });
    }

    /**
     * Move a section up in order.
     */
    public function moveUp(Section $section): Section
    {
        if ($section->order <= 1) {
            return $section;
        }

        return DB::transaction(function () use ($section) {
            $previousSection = Section::where('page_id', $section->page_id)
                ->where('order', $section->order - 1)
                ->first();

            if ($previousSection) {
                $previousSection->update(['order' => $section->order]);
                $section->update(['order' => $section->order - 1]);
            }

            return $section->fresh();
        });
    }

    /**
     * Move a section down in order.
     */
    public function moveDown(Section $section): Section
    {
        return DB::transaction(function () use ($section) {
            $nextSection = Section::where('page_id', $section->page_id)
                ->where('order', $section->order + 1)
                ->first();

            if ($nextSection) {
                $nextSection->update(['order' => $section->order]);
                $section->update(['order' => $section->order + 1]);
            }

            return $section->fresh();
        });
    }

    /**
     * Duplicate a section.
     */
    public function duplicate(Section $section): Section
    {
        return DB::transaction(function () use ($section) {
            // Increment order of all sections after this one
            Section::where('page_id', $section->page_id)
                ->where('order', '>', $section->order)
                ->increment('order');

            // Create duplicate
            $newSection = $section->replicate();
            $newSection->order = $section->order + 1;
            $newSection->save();

            return $newSection;
        });
    }

    /**
     * Get available component types from database.
     */
    public function getAvailableComponentTypes(): array
    {
        return ComponentType::toComponentTypesArray();
    }
}
