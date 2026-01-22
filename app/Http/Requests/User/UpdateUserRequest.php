<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * Update User Request
 * 
 * Validates data for updating an existing user.
 */
class UpdateUserRequest extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'password' => ['nullable', Password::defaults()],
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
