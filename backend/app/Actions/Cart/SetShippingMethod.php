<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Enums\ShippingMethod;
use App\Exceptions\CartException;
use App\Models\Cart;

/** Chooses a shipping method; it must be offered for the cart's destination. */
final readonly class SetShippingMethod
{
    public function __construct(private QuoteShippingOptions $quoteShipping) {}

    /** @throws CartException */
    public function handle(Cart $cart, ShippingMethod $method): void
    {
        foreach ($this->quoteShipping->handle($cart->destination_country) as $option) {
            if ($option->method === $method) {
                $cart->update(['shipping_method' => $method]);

                return;
            }
        }

        throw CartException::shippingUnavailable();
    }
}
