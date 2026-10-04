<?php

declare(strict_types=1);

namespace App\Services\Orders;

use App\Models\Order;
use Illuminate\Contracts\Session\Session;

/**
 * Remembers in the session which orders this browser placed, so a guest can
 * open the confirmation page of their own order (contract §10.2) without an
 * account, while the same link opened anywhere else answers 403.
 */
final readonly class PlacedOrdersSession
{
    private const string KEY = 'placed_orders';

    public function __construct(private Session $session) {}

    public function remember(Order $order): void
    {
        if (! $this->contains($order)) {
            $this->session->push(self::KEY, $order->number);
        }
    }

    public function contains(Order $order): bool
    {
        $numbers = $this->session->get(self::KEY, []);

        return is_array($numbers) && in_array($order->number, $numbers, true);
    }
}
