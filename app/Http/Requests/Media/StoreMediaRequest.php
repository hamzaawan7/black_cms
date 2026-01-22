<?php

namespace App\Http\Requests\Media;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required_without:url',
                'file',
                'max:20480', // 20MB max
                'mimetypes:image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,video/mp4,video/webm,audio/mpeg,audio/mp3',
            ],
            'url' => ['required_without:file', 'nullable', 'url', 'max:500'],
            'name' => ['nullable', 'string', 'max:255'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', Rule::in(['image', 'video', 'document', 'audio'])], // Made optional, auto-detected from file
            'folder' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9\/\-_]+$/i'],
            'metadata' => ['nullable', 'array'],
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
            'file.required_without' => 'Please upload a file or provide a URL.',
            'url.required_without' => 'Please provide a URL or upload a file.',
            'file.max' => 'The file may not be greater than 10MB.',
            'folder.regex' => 'The folder path may only contain letters, numbers, slashes, hyphens, and underscores.',
        ];
    }
}
