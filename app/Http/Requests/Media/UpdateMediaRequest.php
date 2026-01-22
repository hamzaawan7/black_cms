<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\BaseFormRequest;

class UpdateMediaRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
            'folder' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9\/\-_]+$/i'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
