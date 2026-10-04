<?php

declare(strict_types=1);

namespace App\DTOs\Checkout;

use App\Models\Order;
use App\Models\User;

/** The outcome of a checkout request. */
final readonly class PlacedOrder
{
    public function __construct(
        public Order $order,
        /** True when the Idempotency-Key had already placed this order (200 instead of 201). */
        public bool $replayed,
        /** The account created at checkout ("Create an account?"), to log in. */
        public ?User $createdAccount = null,
    ) {}
}
