<?php

namespace App\Http\Requests\Faq;

use App\Http\Requests\BaseFormRequest;

class UpdateFaqRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question' => ['sometimes', 'required', 'string', 'max:500'],
            'answer' => ['sometimes', 'required', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:100'],
            'order' => ['integer', 'min:0'],
            'is_published' => ['boolean'],
        ];
    }
}
