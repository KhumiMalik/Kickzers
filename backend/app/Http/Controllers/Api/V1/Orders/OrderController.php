<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Orders\OrderResource;
use App\Models\Order;
use App\Repositories\Orders\OrderRepository;
use App\Services\Orders\PlacedOrdersSession;
use Illuminate\Support\Facades\Gate;

/**
 * `GET /orders/{number}`: the order confirmation page. Allowed for the browser
 * session that placed the order, or for the account that owns it
 * (OrderPolicy::view); everyone else gets 403 and is sent to tracking.
 */
final class OrderController extends Controller
{
    public function __invoke(Order $order, PlacedOrdersSession $placedOrders, OrderRepository $orders): OrderResource
    {
        if (! $placedOrders->contains($order)) {
            Gate::authorize('view', $order);
        }

        return new OrderResource($orders->loadDetail($order));
    }
}
