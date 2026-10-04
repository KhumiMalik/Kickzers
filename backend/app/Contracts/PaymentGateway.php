<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Enums\PaymentMethod;

/**
 * A way to pay that the checkout can offer. Every gateway describes itself
 * for the payment method list; Phase 9 adds the step that handles an order.
 *
 * A new gateway (e.g. PayPal) implements this interface and is registered in
 * AppServiceProvider; no controller or frontend change is needed to list it.
 */
interface PaymentGateway
{
    public function method(): PaymentMethod;

    /** Name shown next to the radio button ("Cash on delivery"). */
    public function name(): string;

    /** Instructions shown under the selected option. */
    public function description(): string;

    /** Absolute URL of a logo, or null for none. */
    public function image(): ?string;
}
