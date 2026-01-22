<?php

namespace App\Http\Requests\Testimonial;

use App\Http\Requests\BaseFormRequest;

class UpdateTestimonialRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'author_name' => ['sometimes', 'required', 'string', 'max:255'],
            'author_title' => ['nullable', 'string', 'max:255'],
            'author_image' => ['nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string', 'max:2000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'order' => ['integer', 'min:0'],
            'is_featured' => ['boolean'],
            'is_published' => ['boolean'],
        ];
    }
}
