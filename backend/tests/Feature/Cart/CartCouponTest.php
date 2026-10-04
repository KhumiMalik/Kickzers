<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Testing\TestResponse;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    $this->withHeaders(spaHeaders())->withCredentials();

    $this->cart = Cart::factory()->create();
    CartItem::factory()->for($this->cart)->for(Product::factory()->priced(4999))->quantity(3)->create();
});

function applyCoupon(string $code): TestResponse
{
    return test()->withCookie(CartCookie::NAME, test()->cart->token)
        ->postJson(route('api.v1.cart.coupon.store'), ['code' => $code]);
}

it('applies a percent coupon in any letter case, rounding the discount half up', function (): void {
    // 10% of 149.97 is 14.997, which rounds to 15.00.
    applyCoupon(' kickzers10 ')
        ->assertOk()
        ->assertJsonPath('data.coupon', ['code' => 'KICKZERS10', 'description' => '10% off'])
        ->assertJsonPath('data.totals', ['subtotal' => 14997, 'discount' => 1500, 'shipping' => 200, 'total' => 13697]);
});

it('caps a fixed coupon at the subtotal and never discounts shipping', function (): void {
    Coupon::factory()->fixed(50000)->create(['code' => 'HUGE']);

    applyCoupon('HUGE')->assertJsonPath('data.totals', ['subtotal' => 14997, 'discount' => 14997, 'shipping' => 200, 'total' => 200]);
});

it('explains why a coupon cannot be used', function (Closure $makeCoupon, string $message): void {
    $makeCoupon();

    applyCoupon('NOPE')
        ->assertUnprocessable()
        ->assertExactJson(['message' => $message, 'errors' => ['code' => [$message]]]);
})->with([
    'unknown' => [fn () => null, 'This coupon code is not valid.'],
    'switched off' => [fn () => Coupon::factory()->inactive()->create(['code' => 'NOPE']), 'This coupon code is not valid.'],
    'not started' => [fn () => Coupon::factory()->notStarted()->create(['code' => 'NOPE']), 'This coupon is not valid yet.'],
    'expired' => [fn () => Coupon::factory()->expired()->create(['code' => 'NOPE']), 'This coupon has expired.'],
    'used up' => [fn () => Coupon::factory()->exhausted()->create(['code' => 'NOPE']), 'This coupon has reached its usage limit.'],
    'minimum not met' => [fn () => Coupon::factory()->withMinimumSubtotal(50000)->create(['code' => 'NOPE']), 'Spend $500.00 or more to use this coupon.'],
]);

it('asks for a code when none is given', function (): void {
    applyCoupon('')->assertUnprocessable()->assertJsonPath('errors.code', ['Please enter a coupon code.']);
});

it('replaces the coupon with a new code and removes it on request', function (): void {
    applyCoupon('KICKZERS10')->assertOk();
    applyCoupon('SAVE20')->assertJsonPath('data.coupon.code', 'SAVE20');

    $this->withCookie(CartCookie::NAME, $this->cart->token)
        ->deleteJson(route('api.v1.cart.coupon.destroy'))
        ->assertOk()
        ->assertJsonPath('data.coupon', null)
        ->assertJsonPath('data.totals.discount', 0);
});
