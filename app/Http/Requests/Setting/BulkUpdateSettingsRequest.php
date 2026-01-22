<?php

namespace App\Http\Requests\Setting;

use App\Http\Requests\BaseFormRequest;

class BulkUpdateSettingsRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'max:255'],
            'settings.*.value' => ['nullable', 'string', 'max:10000'],
            'settings.*.group' => ['nullable', 'string', 'max:100'],
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
            'settings.required' => 'Please provide settings to update.',
            'settings.*.key.required' => 'Each setting must have a key.',
        ];
    }
}
