<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Enums\PaymentMethod;

/** Offline: the customer pays the courier when the order arrives. */
final class CashOnDeliveryGateway implements PaymentGateway
{
    public function method(): PaymentMethod
    {
        return PaymentMethod::CashOnDelivery;
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
}
