<?php

namespace App\Http\Requests\Setting;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'value' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
