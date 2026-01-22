<?php

namespace App\Http\Requests\Menu;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class StoreMenuRequest extends BaseFormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'location' => [
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
            'items' => ['required', 'array', 'min:1'],
            'items.*.label' => ['nullable', 'string', 'max:100'],
            'items.*.title' => ['nullable', 'string', 'max:100'],  // API uses title, not label
            'items.*.url' => ['required', 'string', 'max:500'],
            'items.*.target' => ['nullable', Rule::in(['_self', '_blank'])],
            'items.*.icon' => ['nullable', 'string', 'max:100'],
            'items.*.order' => ['nullable', 'integer', 'min:0'],
            'items.*.children' => ['nullable', 'array'],
            'items.*.children.*.label' => ['nullable', 'string', 'max:100'],
            'items.*.children.*.title' => ['nullable', 'string', 'max:100'],
            'items.*.children.*.url' => ['required_with:items.*.children', 'string', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'At least one menu item is required.',
            'items.*.url.required' => 'Each menu item must have a URL.',
        ];
    }
}
