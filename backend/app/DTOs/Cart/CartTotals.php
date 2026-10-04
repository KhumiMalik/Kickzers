<?php

declare(strict_types=1);

namespace App\DTOs\Cart;

/**
 * The money of a cart (minor units). The frontend never computes these; it
 * displays them. Checkout copies them onto the order.
 */
final readonly class CartTotals
{
    /**
     * @param  list<CartLine>  $lines
     */
    public function __construct(
        public array $lines,
        public int $subtotal,
        public int $discount,
        public int $shipping,
        public int $total,
        public int $itemCount,
    ) {}
}
