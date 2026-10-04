<?php

declare(strict_types=1);

namespace App\Services\Payments;

use App\Contracts\PaymentGateway;
use App\Enums\PaymentMethod;

/**
 * The gateways enabled in this shop, in the order the checkout lists them.
 * Bound as a singleton in AppServiceProvider.
 */
final readonly class PaymentGatewayRegistry
{
    /** @var list<PaymentGateway> */
    private array $gateways;

    public function __construct(PaymentGateway ...$gateways)
    {
        $this->gateways = array_values($gateways);
    }

    /** @return list<PaymentGateway> */
    public function enabled(): array
    {
        return $this->gateways;
    }

    /** The gateway for a method, or null when that method is not enabled. */
    public function find(PaymentMethod $method): ?PaymentGateway
    {
        foreach ($this->gateways as $gateway) {
            if ($gateway->method() === $method) {
                return $gateway;
            }
        }

        return null;
    }
}
