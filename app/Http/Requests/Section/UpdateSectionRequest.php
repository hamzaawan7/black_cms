<?php

namespace App\Http\Requests\Section;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Support\Facades\Log;

class UpdateSectionRequest extends BaseFormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];
        
        // Handle content - decode if it's a JSON string
        if ($this->has('content')) {
            $content = $this->input('content');
            if (is_string($content)) {
                $decoded = json_decode($content, true);
                $data['content'] = is_array($decoded) ? $decoded : [];
            } elseif (is_array($content)) {
                $data['content'] = $content;
            }
        }
        
        // Handle styles - decode if it's a JSON string
        if ($this->has('styles')) {
            $styles = $this->input('styles');
            if (is_string($styles)) {
                $decoded = json_decode($styles, true);
                $data['styles'] = is_array($decoded) ? $decoded : [];
            } elseif (is_array($styles)) {
                $data['styles'] = $styles;
            }
        }
        
        // Handle settings - decode if it's a JSON string
        if ($this->has('settings')) {
            $settings = $this->input('settings');
            if (is_string($settings)) {
                $decoded = json_decode($settings, true);
                $data['settings'] = is_array($decoded) ? $decoded : [];
            } elseif (is_array($settings)) {
                $data['settings'] = $settings;
            }
        }
        
        if (!empty($data)) {
            $this->merge($data);
        }
        
        Log::debug('Section Update Request', [
            'raw_content' => $this->input('content'),
            'processed' => $data,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'component_type' => ['sometimes', 'required', 'string', 'max:100'],
            'order' => ['integer', 'min:0'],
            'is_visible' => ['boolean'],
            'content' => ['nullable', 'array'],
            'styles' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
        ];
    }
}
