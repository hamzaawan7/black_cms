<?php

namespace App\Http\Requests\Section;

use App\Http\Requests\BaseFormRequest;

class StoreSectionRequest extends BaseFormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Handle JSON strings for content, styles, and settings
        $data = [];
        
        if ($this->has('content') && is_string($this->content)) {
            $data['content'] = json_decode($this->content, true) ?? [];
        }
        
        if ($this->has('styles') && is_string($this->styles)) {
            $data['styles'] = json_decode($this->styles, true) ?? [];
        }
        
        if ($this->has('settings') && is_string($this->settings)) {
            $data['settings'] = json_decode($this->settings, true) ?? [];
        }
        
        if (!empty($data)) {
            $this->merge($data);
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
            'page_id' => ['required', 'exists:pages,id'],
            'component_type' => ['required', 'string', 'max:100'],
            'order' => ['integer', 'min:0'],
            'is_visible' => ['boolean'],
            'content' => ['nullable', 'array'],
            'styles' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
        ];
    }
}
