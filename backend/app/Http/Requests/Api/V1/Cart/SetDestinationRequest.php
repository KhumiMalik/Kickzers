<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cart;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * `PUT /cart/destination` (contract §9): a country we ship to and,
 * optionally, one of its states and a postcode.
 */
final class SetDestinationRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'country' => ['required', 'string', 'size:2', 'exists:countries,code'],
            'state' => ['nullable', 'string', Rule::exists('country_states', 'name')->where('country_code', $this->countryCode())],
            'postcode' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'country.required' => 'Please choose a country.',
            'country.exists' => 'Please choose a country.',
            'state.exists' => 'Please choose a state in this country.',
        ];
    }

    public function countryCode(): string
    {
        return Str::upper($this->string('country')->trim()->toString());
    }

    public function state(): ?string
    {
        return $this->string('state')->trim()->toString() ?: null;
    }

    public function postcode(): ?string
    {
        return $this->string('postcode')->trim()->toString() ?: null;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('country'))) {
            $this->merge(['country' => $this->countryCode()]);
        }
    }
}
