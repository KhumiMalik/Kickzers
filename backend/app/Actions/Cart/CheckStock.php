<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Exceptions\CartException;
use App\Models\Product;

/** Whether a quantity of a product can go into a cart: per-order limit and current stock. */
final class CheckStock
{
    /** @throws CartException */
    public function ensureAvailable(Product $product, int $quantity): void
    {
        if (! $product->isPurchasable()) {
            throw CartException::notPurchasable($product);
        }

        if ($quantity > Product::MAX_QUANTITY_PER_ORDER) {
            throw CartException::quantityLimit(Product::MAX_QUANTITY_PER_ORDER);
        }

        if ($quantity > $product->stock_quantity) {
            throw CartException::notEnoughStock($product);
        }
    }
}
