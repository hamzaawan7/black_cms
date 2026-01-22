<?php

namespace App\Http\Requests\Menu;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends BaseFormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert JSON string items to array if needed
        if ($this->has('items') && is_string($this->items)) {
            $this->merge([
                'items' => json_decode($this->items, true) ?? [],
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                // Allow all location types used in the system
                Rule::in([
                    'header', 'footer', 'sidebar', 'mobile', 'social',
                    'footer-services', 'footer-about', 'footer-vip', 'footer-legal',
                    'services',
                ]),
            ],
            'items' => ['sometimes', 'required', 'array', 'min:1'],
            'items.*.label' => ['nullable', 'string', 'max:100'],
            'items.*.title' => ['nullable', 'string', 'max:100'],  // API uses title, not label
            'items.*.url' => ['required_with:items', 'string', 'max:500'],
            'items.*.target' => ['nullable', Rule::in(['_self', '_blank'])],
            'items.*.icon' => ['nullable', 'string', 'max:100'],
            'items.*.order' => ['nullable', 'integer', 'min:0'],
            'items.*.children' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}
