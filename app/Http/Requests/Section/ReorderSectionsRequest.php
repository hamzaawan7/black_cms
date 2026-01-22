<?php

namespace App\Http\Requests\Section;

use App\Http\Requests\BaseFormRequest;

class ReorderSectionsRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.id' => ['required', 'exists:sections,id'],
            'sections.*.order' => ['required', 'integer', 'min:0'],
        ];
    }
}
