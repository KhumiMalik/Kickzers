<?php

declare(strict_types=1);

namespace App\DTOs\Cart;

use App\Models\Cart;

/** Everything the Cart resource shows (contract §2.7), computed by SummarizeCart. */
final readonly class CartSummary
{
    /**
     * @param  list<ShippingOption>  $shippingOptions  methods available for the destination
     * @param  list<string>  $notices  changes the server made since the last read
     */
    public function __construct(
        public Cart $cart,
        public CartTotals $totals,
        public array $shippingOptions,
        public array $notices,
    ) {}
}
