<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Shipping methods offered at checkout. Prices live in the shipping_rates
 * table (default rate plus optional per-country overrides).
 */
enum ShippingMethod: string
{
    case FlatRate5 = 'flat_rate_5';
    case Free = 'free';
    case FlatRate10 = 'flat_rate_10';
    case LocalDelivery = 'local_delivery';

    public function label(): string
    {
        return match ($this) {
            self::FlatRate5, self::FlatRate10 => 'Flat Rate',
            self::Free => 'Free Shipping',
            self::LocalDelivery => 'Local Delivery',
        };
    }

    /** Only offered when the destination is the store's own country (or not chosen yet). */
    public function isDomesticOnly(): bool
    {
        return $this === self::LocalDelivery;
    }
}
