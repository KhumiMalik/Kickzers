<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;

/**
 * Sets where the cart ships to (the cart page "Calculate shipping" form).
 * If the chosen shipping method is not offered there, the next cart read
 * (ReconcileCart) switches to the cheapest method and says so in a notice.
 */
final class SetDestination
{
    public function handle(Cart $cart, string $countryCode, ?string $state, ?string $postcode): void
    {
        $cart->update([
            'destination_country' => $countryCode,
            'destination_state' => $state,
            'destination_postcode' => $postcode,
        ]);
    }
}
