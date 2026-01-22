<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Store User Request
 * 
 * Validates data for creating a new user.
 */
class StoreUserRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', 'in:super_admin,tenant_admin,editor'],
            'tenant_id' => [
                'nullable',
                'integer',
                'exists:tenants,id',
                function ($attribute, $value, $fail) {
                    // Tenant is required for non-super_admin roles
                    if ($this->input('role') !== 'super_admin' && empty($value)) {
                        $fail('A tenant is required for tenant admins and editors.');
                    }
                },
            ],
            'avatar' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
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
            'name.required' => 'The user name is required.',
            'email.required' => 'The email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'A password is required.',
            'role.required' => 'Please select a user role.',
            'role.in' => 'Invalid role selected.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'tenant_id' => 'tenant',
            'is_active' => 'active status',
        ];
    }
}
