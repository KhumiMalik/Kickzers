<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Checkout;

use App\DTOs\Checkout\AddressData;
use App\DTOs\Checkout\CheckoutData;
use App\Enums\PaymentMethod;
use App\Exceptions\IdempotencyException;
use App\Models\User;
use App\Services\Payments\PaymentGatewayRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use LogicException;

/**
 * `POST /checkout` (contract §10.1). The cart itself is checked by
 * PlaceOrder; this validates the form and the Idempotency-Key header.
 */
final class CheckoutRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $guestCreatesAccount = $this->user() === null && $this->boolean('create_account');

        return [
            ...$this->addressRules('billing', withContact: true),
            'billing.email' => [
                'required', 'string', 'email', 'max:255',
                // Checking out as a guest with an existing account's e-mail is fine; creating
                // a second account for it is not.
                ...($guestCreatesAccount ? [Rule::unique('users', 'email')] : []),
            ],
            'ship_to_different_address' => ['sometimes', 'boolean'],
            'shipping_address' => ['exclude_unless:ship_to_different_address,true', 'required', 'array'],
            ...$this->addressRules('shipping_address', withContact: false),
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'string', Rule::in($this->enabledPaymentMethods())],
            'create_account' => ['sometimes', 'boolean'],
            'password' => ['exclude_unless:create_account,true', 'required', 'string', 'min:8', 'max:255'],
            'accept_terms' => ['accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'billing.email.unique' => 'An account with this email already exists. Please log in.',
            'payment_method.required' => 'Please choose a payment method.',
            'payment_method.in' => 'Please choose a payment method.',
            'accept_terms.accepted' => 'Please accept the terms & conditions.',
            'billing.country.required' => 'Please choose a country.',
            'billing.country.exists' => 'Please choose a country.',
            'shipping_address.country.required' => 'Please choose a country.',
            'shipping_address.country.exists' => 'Please choose a country.',
            'billing.state.exists' => 'Please choose a state in this country.',
            'shipping_address.state.exists' => 'Please choose a state in this country.',
        ];
    }

    /**
     * Readable field names: "The first name field is required." instead of
     * "The billing.first_name field is required.".
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        $names = [
            'first_name' => 'first name', 'last_name' => 'last name', 'company' => 'company name',
            'phone' => 'phone number', 'email' => 'email address', 'country' => 'country', 'state' => 'state',
            'city' => 'town/city', 'address_line_1' => 'address', 'address_line_2' => 'address line 2',
            'postcode' => 'postcode',
        ];

        $attributes = [];
        foreach (['billing', 'shipping_address'] as $prefix) {
            foreach ($names as $field => $name) {
                $attributes["{$prefix}.{$field}"] = $name;
            }
        }

        return $attributes;
    }

    public function toData(): CheckoutData
    {
        $billing = $this->address('billing', withContact: true);
        $shipping = $this->boolean('ship_to_different_address')
            ? $this->address('shipping_address', withContact: false)
            : $billing->withoutContact();
        $createAccount = $this->user() === null && $this->boolean('create_account');

        return new CheckoutData(
            idempotencyKey: $this->idempotencyKey(),
            email: $this->string('billing.email')->toString(),
            billing: $billing,
            shipping: $shipping,
            notes: $this->string('notes')->trim()->toString() ?: null,
            paymentMethod: $this->enum('payment_method', PaymentMethod::class)
                ?? throw new LogicException('Called before validation passed.'),
            createAccount: $createAccount,
            password: $createAccount ? $this->string('password')->toString() : null,
        );
    }

    /**
     * Rejects a missing or malformed Idempotency-Key before anything else
     * (400), lower-cases the e-mail, upper-cases country codes and fills the
     * e-mail of logged-in customers from their account.
     */
    protected function prepareForValidation(): void
    {
        if (! Str::isUuid($this->header('Idempotency-Key'))) {
            throw IdempotencyException::missingKey();
        }

        $billing = $this->input('billing');

        if (! is_array($billing)) {
            return;
        }

        $user = $this->user();

        if ($user instanceof User) {
            // "Create an account?" is ignored for customers who are logged in.
            $this->merge(['create_account' => false]);
        }

        $email = is_string($billing['email'] ?? null) ? trim($billing['email']) : '';

        if ($email === '' && $user instanceof User) {
            $email = $user->email;
        }

        $billing['email'] = Str::lower($email);
        $billing['country'] = is_string($billing['country'] ?? null) ? Str::upper(trim($billing['country'])) : null;

        $shippingAddress = $this->input('shipping_address');
        if (is_array($shippingAddress) && is_string($shippingAddress['country'] ?? null)) {
            $shippingAddress['country'] = Str::upper(trim($shippingAddress['country']));
            $this->merge(['shipping_address' => $shippingAddress]);
        }

        $this->merge(['billing' => $billing]);
    }

    private function idempotencyKey(): string
    {
        $key = $this->header('Idempotency-Key');

        return is_string($key) ? Str::lower($key) : throw IdempotencyException::missingKey();
    }

    /**
     * Rules shared by the billing and shipping address. Shipping rules only
     * apply when "Ship to a different address?" is ticked.
     *
     * @return array<string, list<mixed>>
     */
    private function addressRules(string $prefix, bool $withContact): array
    {
        $only = $prefix === 'shipping_address' ? ['exclude_unless:ship_to_different_address,true'] : [];
        $country = $this->input("{$prefix}.country");

        $rules = [
            "{$prefix}.first_name" => [...$only, 'required', 'string', 'max:255'],
            "{$prefix}.last_name" => [...$only, 'required', 'string', 'max:255'],
            "{$prefix}.company" => [...$only, 'nullable', 'string', 'max:255'],
            "{$prefix}.country" => [...$only, 'required', 'string', 'size:2', 'exists:countries,code'],
            "{$prefix}.state" => [
                ...$only, 'nullable', 'string',
                Rule::exists('country_states', 'name')->where('country_code', is_string($country) ? $country : ''),
            ],
            "{$prefix}.city" => [...$only, 'required', 'string', 'max:255'],
            "{$prefix}.address_line_1" => [...$only, 'required', 'string', 'max:255'],
            "{$prefix}.address_line_2" => [...$only, 'nullable', 'string', 'max:255'],
            "{$prefix}.postcode" => [...$only, 'nullable', 'string', 'max:20'],
        ];

        if ($withContact) {
            $rules["{$prefix}.phone"] = ['required', 'string', 'max:30'];
        }

        return $rules;
    }

    private function address(string $prefix, bool $withContact): AddressData
    {
        $optional = fn (string $field): ?string => $this->string("{$prefix}.{$field}")->trim()->toString() ?: null;
        $required = fn (string $field): string => $this->string("{$prefix}.{$field}")->trim()->toString();

        return new AddressData(
            firstName: $required('first_name'),
            lastName: $required('last_name'),
            company: $optional('company'),
            phone: $withContact ? $required('phone') : null,
            email: $withContact ? $required('email') : null,
            countryCode: $required('country'),
            state: $optional('state'),
            city: $required('city'),
            addressLine1: $required('address_line_1'),
            addressLine2: $optional('address_line_2'),
            postcode: $optional('postcode'),
        );
    }

    /** @return list<string> */
    private function enabledPaymentMethods(): array
    {
        $codes = [];
        foreach (app(PaymentGatewayRegistry::class)->enabled() as $gateway) {
            $codes[] = $gateway->method()->value;
        }

        return $codes;
    }
}
