<?php

declare(strict_types=1);

namespace App\DTOs\Cart;

use App\Enums\ShippingMethod;

/** A shipping method offered for a destination, with its price there (minor units). */
final readonly class ShippingOption
{
    public function __construct(
        public ShippingMethod $method,
        public int $price,
    ) {}
}
