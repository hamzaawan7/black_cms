<?php

namespace App\Http\Requests\Service;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends BaseFormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $jsonFields = ['content', 'stats', 'benefits', 'what_is'];
        
        foreach ($jsonFields as $field) {
            if ($this->has($field) && is_string($this->$field)) {
                $value = $this->$field;
                
                // Try to decode as JSON first
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $this->merge([$field => $decoded]);
                } elseif (!empty($value)) {
                    // If it's a plain string, wrap it in an array
                    $this->merge([$field => [$value]]);
                }
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $serviceId = $this->route('service')?->id ?? $this->route('service');

        return [
            'category_id' => ['sometimes', 'required', 'exists:service_categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('services')->where(function ($query) {
                    return $query->where('tenant_id', auth()->user()->tenant_id);
                })->ignore($serviceId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'headline' => ['nullable', 'string', 'max:255'],
            'pricing' => ['nullable', 'string', 'max:100'],
            'image' => ['nullable', 'string', 'max:500'],
            'secondary_image' => ['nullable', 'string', 'max:500'],
            'vial_image' => ['nullable', 'string', 'max:500'],
            'is_popular' => ['boolean'],
            'is_published' => ['boolean'],
            'is_active' => ['boolean'], // Alias for is_published
            'order' => ['integer', 'min:0'],
            'content' => ['nullable', 'array'],
            'stats' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'what_is' => ['nullable', 'array'],
        ];
    }
}
