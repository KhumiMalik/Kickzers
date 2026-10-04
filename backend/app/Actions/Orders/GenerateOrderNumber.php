<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Models\Order;

/**
 * Order numbers look like "KZ-2026-000042": readable on the phone, sortable,
 * and unique because they are built from the order's primary key. They are
 * assigned right after the insert, inside the PlaceOrder transaction.
 */
final class GenerateOrderNumber
{
    public const string PREFIX = 'KZ';

    public function handle(Order $order): string
    {
        return sprintf('%s-%d-%06d', self::PREFIX, $order->placed_at->year, $order->id);
    }
}
