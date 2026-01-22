<?php

namespace App\Http\Requests\ServiceCategory;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceCategoryRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Try both route parameter names
        $categoryId = $this->route('service_category')?->id 
            ?? $this->route('serviceCategory')?->id 
            ?? $this->route('category')?->id 
            ?? $this->route('service_category') 
            ?? $this->route('serviceCategory')
            ?? $this->route('category');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('service_categories')->ignore($categoryId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
