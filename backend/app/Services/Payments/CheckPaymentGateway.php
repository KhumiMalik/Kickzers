<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\DTOs\Checkout\PaymentResult;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;

/** Offline: the customer posts a check; the order ships once it clears. */
final class CheckPaymentGateway implements PaymentGateway
{
    public function method(): PaymentMethod
    {
        return PaymentMethod::Check;
    }

    public function name(): string
    {
        return $this->method()->label();
    }

    public function description(): string
    {
        return $this->method()->description();
    }

    public function image(): ?string
    {
        return null;
    }

    /** Waits until the check has arrived and cleared. */
    public function process(Order $order): PaymentResult
    {
        return new PaymentResult(OrderStatus::Pending, PaymentStatus::Unpaid);
    }
}
