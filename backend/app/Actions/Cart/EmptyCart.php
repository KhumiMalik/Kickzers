<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use Illuminate\Support\Facades\DB;

/**
 * Removes every item and the coupon. The shipping method and destination
 * are kept: they describe the customer, not the products.
 */
final class EmptyCart
{
    public function handle(Cart $cart): void
    {
        if (! $cart->exists) {
            return;
        }

        DB::transaction(function () use ($cart): void {
            $cart->items()->delete();
            $cart->coupon()->dissociate();
            $cart->save();
        });
    }
}
