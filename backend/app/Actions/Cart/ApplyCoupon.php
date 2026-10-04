<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Exceptions\CartException;
use App\Models\Cart;
use App\Repositories\Cart\CartRepository;
use App\Repositories\Cart\CouponRepository;

/**
 * Applies a coupon code to the cart after checking its rules against the
 * current subtotal. A cart holds one coupon; a new code replaces the old one.
 */
final readonly class ApplyCoupon
{
    public function __construct(
        private CartRepository $carts,
        private CouponRepository $coupons,
        private CheckCoupon $checkCoupon,
        private CalculateCartTotals $calculateTotals,
    ) {}

    /** @throws CartException */
    public function handle(Cart $cart, string $code): void
    {
        $this->carts->loadForSummary($cart);
        $subtotal = $this->calculateTotals->handle($cart, [])->subtotal;

        $coupon = $this->checkCoupon->ensureUsable($this->coupons->findByCode($code), $subtotal);

        $cart->coupon()->associate($coupon);
        $cart->save();
    }
}
