<?php

declare(strict_types=1);

use App\Actions\Cart\QuoteShippingOptions;
use App\DTOs\Cart\ShippingOption;
use App\Enums\ShippingMethod;
use App\Models\Country;
use App\Models\ShippingRate;
use Database\Seeders\ReferenceDataSeeder;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
});

/** @return array<string, int> method code => price */
function quote(?string $country): array
{
    $options = app(QuoteShippingOptions::class)->handle($country);

    return array_combine(
        array_map(fn (ShippingOption $option): string => $option->method->value, $options),
        array_map(fn (ShippingOption $option): int => $option->price, $options),
    );
}

it('offers every method, in enum order, before a destination is chosen', function (): void {
    expect(quote(null))->toBe(['flat_rate_5' => 500, 'free' => 0, 'flat_rate_10' => 1000, 'local_delivery' => 200]);
});

it('offers local delivery only in the store country', function (): void {
    expect(quote('US'))->toHaveKey('local_delivery')
        ->and(quote('GB'))->not->toHaveKey('local_delivery');
});

it('uses a country rate instead of the default', function (): void {
    ShippingRate::factory()->forCountry(Country::query()->findOrFail('GB'))->create(['method' => ShippingMethod::Free, 'price' => 1500]);

    expect(quote('GB')['free'])->toBe(1500)
        ->and(quote('PK')['free'])->toBe(0);
});

it('switches a method off when it has no rate at all', function (): void {
    ShippingRate::query()->where('method', ShippingMethod::FlatRate5)->delete();

    expect(quote(null))->not->toHaveKey('flat_rate_5');
});

it('follows the configured store country', function (): void {
    config(['shop.store_country' => 'PK']);

    expect(quote('PK'))->toHaveKey('local_delivery')
        ->and(quote('US'))->not->toHaveKey('local_delivery');
});
