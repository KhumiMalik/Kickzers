<?php

declare(strict_types=1);

use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    $this->withHeaders(spaHeaders())->withCredentials()->withHeader('Idempotency-Key', (string) Str::uuid());
});

it('requires the billing details', function (): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => [
        'first_name' => '', 'last_name' => '', 'phone' => '', 'email' => 'nope', 'country' => '', 'city' => '', 'address_line_1' => '',
    ]]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'billing.first_name', 'billing.last_name', 'billing.phone', 'billing.email', 'billing.country',
            'billing.city', 'billing.address_line_1',
        ])
        ->assertJsonValidationErrors([
            'billing.first_name' => 'The first name field is required.',
            'billing.country' => 'Please choose a country.',
        ]);
});

it('explains the terms, payment method and state rules', function (array $overrides, string $field, string $message): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload($overrides))
        ->assertUnprocessable()
        // Error keys contain dots ("billing.state"), which assertJsonPath() would read as nesting.
        ->assertJsonValidationErrors([$field => $message]);
})->with([
    'terms not accepted' => [['accept_terms' => false], 'accept_terms', 'Please accept the terms & conditions.'],
    'no payment method' => [['payment_method' => null], 'payment_method', 'Please choose a payment method.'],
    'payment method not offered' => [['payment_method' => 'paypal'], 'payment_method', 'Please choose a payment method.'],
    'state of another country' => [['billing' => ['state' => 'Punjab']], 'billing.state', 'Please choose a state in this country.'],
    'country we do not ship to' => [['billing' => ['country' => 'FR']], 'billing.country', 'Please choose a country.'],
]);

it('requires the shipping address only when shipping elsewhere', function (): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload(['ship_to_different_address' => true]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['shipping_address']);

    $this->postJson(route('api.v1.checkout'), checkoutPayload(['ship_to_different_address' => true, 'shipping_address' => ['first_name' => 'Ali']]))
        ->assertJsonValidationErrors(['shipping_address.last_name', 'shipping_address.country', 'shipping_address.city', 'shipping_address.address_line_1'])
        ->assertJsonMissingValidationErrors(['shipping_address.phone', 'shipping_address.email']);
});

it('limits the order notes to 1000 characters', function (): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload(['notes' => str_repeat('a', 1001)]))
        ->assertJsonValidationErrors(['notes']);
});
