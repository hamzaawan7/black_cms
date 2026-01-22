<?php

namespace App\Http\Requests\Tenant;

use App\Http\Requests\BaseFormRequest;

/**
 * Store Tenant Request
 * 
 * Handles validation for creating a new tenant.
 */
class StoreTenantRequest extends BaseFormRequest
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
            'slug' => ['nullable', 'string', 'max:255', 'unique:tenants,slug'],
            'domain' => ['nullable', 'string', 'max:255', 'unique:tenants,domain'],
            'logo' => ['nullable', 'string', 'max:500'],
            'favicon' => ['nullable', 'string', 'max:500'],
            'active_template_id' => ['nullable', 'exists:templates,id'],
            'settings' => ['nullable', 'array'],
            'settings.primary_color' => ['nullable', 'string', 'max:50'],
            'settings.secondary_color' => ['nullable', 'string', 'max:50'],
            'settings.contact_email' => ['nullable', 'email', 'max:255'],
            'settings.contact_phone' => ['nullable', 'string', 'max:50'],
            'settings.address' => ['nullable', 'string', 'max:500'],
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
            'name.required' => 'The tenant name is required.',
            'slug.unique' => 'This slug is already taken by another tenant.',
            'domain.unique' => 'This domain is already assigned to another tenant.',
            'active_template_id.exists' => 'The selected template does not exist.',
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
            'active_template_id' => 'template',
            'settings.primary_color' => 'primary color',
            'settings.secondary_color' => 'secondary color',
            'settings.contact_email' => 'contact email',
            'settings.contact_phone' => 'contact phone',
        ];
    }
}
