<?php

declare(strict_types=1);

use App\Actions\Cart\CheckCoupon;
use App\Exceptions\CartException;
use App\Models\Coupon;

it('accepts a usable coupon', function (): void {
    expect((new CheckCoupon)->violation(Coupon::factory()->create(), 1000))->toBeNull();
});

it('names the first rule a coupon breaks', function (Closure $makeCoupon, int $subtotal, string $message): void {
    $violation = (new CheckCoupon)->violation($makeCoupon(), $subtotal);

    expect($violation)->toBeInstanceOf(CartException::class)
        ->and($violation?->getMessage())->toBe($message)
        ->and($violation?->field)->toBe('code');
})->with([
    'missing' => [fn () => null, 1000, 'This coupon code is not valid.'],
    'inactive' => [fn () => Coupon::factory()->inactive()->create(), 1000, 'This coupon code is not valid.'],
    'not started' => [fn () => Coupon::factory()->notStarted()->create(), 1000, 'This coupon is not valid yet.'],
    'expired' => [fn () => Coupon::factory()->expired()->create(), 1000, 'This coupon has expired.'],
    'used up' => [fn () => Coupon::factory()->exhausted()->create(), 1000, 'This coupon has reached its usage limit.'],
    'below minimum' => [fn () => Coupon::factory()->withMinimumSubtotal(5000)->create(), 4999, 'Spend $50.00 or more to use this coupon.'],
]);

it('treats the boundaries as usable', function (): void {
    $check = new CheckCoupon;
    $this->freezeTime();

    expect($check->violation(Coupon::factory()->withMinimumSubtotal(5000)->create(), 5000))->toBeNull()
        ->and($check->violation(Coupon::factory()->create(['starts_at' => now()]), 1000))->toBeNull()
        ->and($check->violation(Coupon::factory()->create(['max_uses' => 3, 'times_used' => 2]), 1000))->toBeNull();
});

it('stops a coupon the moment it expires', function (): void {
    $this->freezeTime();
    $coupon = Coupon::factory()->create(['expires_at' => now()->addSecond()]);

    expect((new CheckCoupon)->violation($coupon, 1000))->toBeNull();

    $this->travel(2)->seconds();

    expect((new CheckCoupon)->violation($coupon, 1000)?->getMessage())->toBe('This coupon has expired.');
});

it('throws from ensureUsable and returns the coupon otherwise', function (): void {
    $coupon = Coupon::factory()->create();

    expect((new CheckCoupon)->ensureUsable($coupon, 1000))->toBe($coupon)
        ->and(fn () => (new CheckCoupon)->ensureUsable(null, 1000))->toThrow(CartException::class, 'This coupon code is not valid.');
});
