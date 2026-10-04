<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Payment methods. Each one is handled by a PaymentGateway implementation
 * (Phase 9), so adding a real gateway later does not change checkout.
 */
enum PaymentMethod: string
{
    case CashOnDelivery = 'cash_on_delivery';
    case Check = 'check';

    public function label(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Cash on delivery',
            self::Check => 'Check payments',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::CashOnDelivery => 'Pay with cash when your order is delivered.',
            self::Check => 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.',
        };
    }
}
