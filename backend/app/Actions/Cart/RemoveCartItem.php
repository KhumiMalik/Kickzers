<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\CartItem;

/** Removes one line from the cart. */
final class RemoveCartItem
{
    public function handle(CartItem $item): void
    {
        $item->delete();
    }
}
