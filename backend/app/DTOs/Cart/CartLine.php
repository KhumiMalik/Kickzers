<?php

declare(strict_types=1);

namespace App\DTOs\Cart;

use App\Models\CartItem;
use App\Models\Product;

/** One priced cart line: the item, its product and the amounts (minor units). */
final readonly class CartLine
{
    public function __construct(
        public CartItem $item,
        public Product $product,
        public int $unitPrice,
        public int $lineTotal,
    ) {}
}
