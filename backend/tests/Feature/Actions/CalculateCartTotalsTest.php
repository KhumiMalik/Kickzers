<?php

declare(strict_types=1);

use App\Actions\Cart\CalculateCartTotals;
use App\DTOs\Cart\ShippingOption;
use App\Enums\ShippingMethod;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;

/*
 * The cart money maths, called directly (no HTTP): integer cents, half-up
 * rounding for percentages, fixed discounts capped at the subtotal, no
 * discount on shipping and free shipping for an empty cart.
 */

function cartWith(array $pricesAndQuantities, ?Coupon $coupon = null, ShippingMethod $method = ShippingMethod::FlatRate10): Cart
{
    $cart = Cart::factory()->create(['shipping_method' => $method, 'coupon_id' => $coupon?->id]);

    foreach ($pricesAndQuantities as [$price, $quantity]) {
        CartItem::factory()->for($cart)->for(Product::factory()->priced($price))->quantity($quantity)->create();
    }

    return $cart->load(['items.product', 'coupon']);
}

/** @return list<ShippingOption> */
function flatRates(): array
{
    return [new ShippingOption(ShippingMethod::FlatRate5, 500), new ShippingOption(ShippingMethod::FlatRate10, 1000)];
}

it('adds up lines, item count and shipping', function (): void {
    $totals = (new CalculateCartTotals)->handle(cartWith([[7500, 2], [15000, 3]]), flatRates());

    expect($totals)
        ->subtotal->toBe(60000)
        ->discount->toBe(0)
        ->shipping->toBe(1000)
        ->total->toBe(61000)
        ->itemCount->toBe(5)
        ->and($totals->lines)->toHaveCount(2)
        ->and($totals->lines[0]->lineTotal)->toBe(15000);
});

it('rounds percentage discounts half up to the cent', function (int $subtotal, int $percent, int $expected): void {
    $coupon = Coupon::factory()->create(['value' => $percent]);

    expect((new CalculateCartTotals)->discount($coupon, $subtotal))->toBe($expected);
})->with([
    '10% of 149.97 = 14.997 → 15.00' => [14997, 10, 1500],
    '10% of 149.94 = 14.994 → 14.99' => [14994, 10, 1499],
    '15% of 0.10 = 0.015 → 0.02 (half up)' => [10, 15, 2],
    '100% of 99.99' => [9999, 100, 9999],
]);

it('caps fixed discounts at the subtotal', function (): void {
    $coupon = Coupon::factory()->fixed(2000)->create();
    $calculate = new CalculateCartTotals;

    expect($calculate->discount($coupon, 5000))->toBe(2000)
        ->and($calculate->discount($coupon, 1500))->toBe(1500)
        ->and($calculate->discount(null, 5000))->toBe(0);
});

it('never discounts shipping', function (): void {
    $totals = (new CalculateCartTotals)->handle(cartWith([[1000, 1]], Coupon::factory()->fixed(5000)->create()), flatRates());

    expect($totals)->discount->toBe(1000)->shipping->toBe(1000)->total->toBe(1000);
});

it('charges no shipping for an empty cart or an unavailable method', function (): void {
    $calculate = new CalculateCartTotals;

    expect($calculate->handle(cartWith([]), flatRates())->shipping)->toBe(0)
        ->and($calculate->handle(cartWith([[1000, 1]], method: ShippingMethod::LocalDelivery), flatRates())->shipping)->toBe(0);
});
