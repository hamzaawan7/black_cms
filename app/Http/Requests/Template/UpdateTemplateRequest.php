<?php

namespace App\Http\Requests\Template;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Template Request
 * 
 * Handles validation for updating an existing template.
 */
class UpdateTemplateRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $templateId = $this->route('template')?->id ?? $this->route('template');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('templates', 'slug')->ignore($templateId),
            ],
            'preview_image' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
            'version' => ['nullable', 'string', 'max:50'],
            'supported_components' => ['nullable', 'array'],
            'supported_components.*' => ['string', 'max:100'],
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
            'name.required' => 'The template name is required.',
            'slug.unique' => 'This slug is already taken by another template.',
            'supported_components.array' => 'Supported components must be an array.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'preview_image' => 'preview image',
            'supported_components' => 'supported components',
        ];
    }
}
