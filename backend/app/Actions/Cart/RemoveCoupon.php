<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;

/** Takes the coupon off the cart. */
final class RemoveCoupon
{
    public function handle(Cart $cart): void
    {
        if (! $cart->exists) {
            return;
        }

        $cart->coupon()->dissociate();
        $cart->save();
    }
}
