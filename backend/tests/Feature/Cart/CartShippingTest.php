<?php

declare(strict_types=1);

use App\Enums\ShippingMethod;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Country;
use App\Models\ShippingRate;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    $this->withHeaders(spaHeaders())->withCredentials();

    $this->cart = Cart::factory()->create();
    CartItem::factory()->for($this->cart)->create();
});

it('switches the shipping method and prices it', function (): void {
    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.shipping-method'), ['method' => 'flat_rate_10'])
        ->assertOk()
        ->assertJsonPath('data.shipping_method', 'flat_rate_10')
        ->assertJsonPath('data.totals.shipping', 1000);
});

it('rejects unknown methods and methods the destination cannot use', function (): void {
    $this->cart->update(['destination_country' => 'GB', 'shipping_method' => 'free']);

    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.shipping-method'), ['method' => 'teleport'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['method']);

    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.shipping-method'), ['method' => 'local_delivery'])
        ->assertUnprocessable()
        ->assertJsonPath('errors.method', ['This shipping method is not available for your destination.']);
});

it('sets the destination and switches away from local delivery abroad, with a notice', function (): void {
    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.destination'), ['country' => 'pk', 'state' => 'Punjab', 'postcode' => ' 54000 '])
        ->assertOk()
        ->assertJsonPath('data.destination', ['country' => 'PK', 'state' => 'Punjab', 'postcode' => '54000'])
        ->assertJsonPath('data.shipping_method', 'free')
        ->assertJsonPath('data.shipping_methods.*.code', ['flat_rate_5', 'free', 'flat_rate_10'])
        ->assertJsonPath('data.notices', ['Shipping changed to Free Shipping: the previous method is not available for your destination.']);
});

it('keeps local delivery for a domestic destination', function (): void {
    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.destination'), ['country' => 'US', 'state' => 'Texas'])
        ->assertJsonPath('data.shipping_method', 'local_delivery')
        ->assertJsonPath('data.notices', []);
});

it('validates the destination', function (array $payload, string $field, string $message): void {
    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.destination'), $payload)
        ->assertUnprocessable()
        ->assertJsonPath("errors.{$field}", [$message]);
})->with([
    'no country' => [[], 'country', 'Please choose a country.'],
    'country we do not ship to' => [['country' => 'FR'], 'country', 'Please choose a country.'],
    'state of another country' => [['country' => 'US', 'state' => 'Punjab'], 'state', 'Please choose a state in this country.'],
]);

it('prices a method with the destination country\'s rate when there is one', function (): void {
    ShippingRate::factory()->forCountry(Country::query()->findOrFail('PK'))->create(['method' => ShippingMethod::FlatRate10, 'price' => 2500]);

    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->putJson(route('api.v1.cart.destination'), ['country' => 'PK'])
        ->assertJsonPath('data.shipping_methods.2', ['code' => 'flat_rate_10', 'name' => 'Flat Rate', 'price' => 2500]);
});

it('does not offer a method that has no rate', function (): void {
    ShippingRate::query()->where('method', ShippingMethod::FlatRate5)->delete();

    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonPath('data.shipping_methods.*.code', ['free', 'flat_rate_10', 'local_delivery']);
});
