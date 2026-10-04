<?php

declare(strict_types=1);

namespace App\DTOs\Checkout;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;

/** What a payment gateway decided for a new order. PlaceOrder stores it on the order. */
final readonly class PaymentResult
{
    public function __construct(
        public OrderStatus $orderStatus,
        public PaymentStatus $paymentStatus,
    ) {}
}
