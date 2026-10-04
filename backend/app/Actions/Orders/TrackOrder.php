<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Exceptions\OrderNotTrackedException;
use App\Models\Order;
use App\Repositories\Orders\OrderRepository;

/** The order tracking form: finds an order by its number and billing e-mail. */
final readonly class TrackOrder
{
    public function __construct(private OrderRepository $orders) {}

    /** @throws OrderNotTrackedException the same 404 whichever of the two is wrong */
    public function handle(string $number, string $email): Order
    {
        return $this->orders->findForTracking($number, $email) ?? throw new OrderNotTrackedException;
    }
}
