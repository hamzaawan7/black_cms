<?php

namespace App\Http\Requests\Tenant;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

/**
 * Update Tenant Request
 * 
 * Handles validation for updating an existing tenant.
 */
class UpdateTenantRequest extends BaseFormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert additional_domains from comma-separated string to array
        if ($this->has('additional_domains') && is_string($this->additional_domains)) {
            $domains = array_filter(array_map('trim', explode(',', $this->additional_domains)));
            $this->merge(['additional_domains' => $domains]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->route('tenant')?->id ?? $this->route('tenant');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tenants', 'slug')->ignore($tenantId),
            ],
            'domain' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('tenants', 'domain')->ignore($tenantId),
            ],
            'additional_domains' => ['nullable', 'array'],
            'additional_domains.*' => ['string', 'max:255'],
            'logo' => ['nullable', 'string', 'max:500'],
            'favicon' => ['nullable', 'string', 'max:500'],
            'active_template_id' => ['nullable', 'exists:templates,id'],
            // Branding colors
            'primary_color' => ['nullable', 'string', 'max:50'],
            'secondary_color' => ['nullable', 'string', 'max:50'],
            'background_color' => ['nullable', 'string', 'max:50'],
            // Contact info
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_address' => ['nullable', 'string', 'max:500'],
            // SEO
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            // Legacy settings (still supported)
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
            'contact_email.email' => 'Please enter a valid email address.',
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
            'primary_color' => 'primary color',
            'secondary_color' => 'secondary color',
            'background_color' => 'background color',
            'contact_email' => 'contact email',
            'contact_phone' => 'contact phone',
            'contact_address' => 'contact address',
            'meta_title' => 'SEO title',
            'meta_description' => 'SEO description',
            'additional_domains' => 'additional domains',
        ];
    }
}
