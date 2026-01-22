<?php

namespace App\Http\Requests\Faq;

use App\Http\Requests\BaseFormRequest;

class StoreFaqRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:100'],
            'order' => ['integer', 'min:0'],
            'is_published' => ['boolean'],
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
            'question.required' => 'The FAQ question is required.',
            'answer.required' => 'The FAQ answer is required.',
        ];
    }
}
