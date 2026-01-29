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
        // Get category ID from route - handle both model binding and raw ID
        $routeCategory = $this->route('service_category') 
            ?? $this->route('serviceCategory') 
            ?? $this->route('category');
        
        // If it's a model, get the ID; if it's already an ID, use it directly
        $categoryId = is_object($routeCategory) ? $routeCategory->id : $routeCategory;
        
        // Get tenant_id for scoped uniqueness
        $tenantId = session('tenant_id', 1);

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('service_categories')
                    ->where('tenant_id', $tenantId)
                    ->ignore($categoryId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:500'],
            'order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
