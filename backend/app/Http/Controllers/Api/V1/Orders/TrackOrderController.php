<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Orders;

use App\Actions\Orders\TrackOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Orders\TrackOrderRequest;
use App\Http\Resources\Api\V1\Orders\OrderTrackingResource;

/** `POST /orders/track`: the order tracking form (rate limited by IP). */
final class TrackOrderController extends Controller
{
    public function __invoke(TrackOrderRequest $request, TrackOrder $trackOrder): OrderTrackingResource
    {
        $order = $trackOrder->handle(
            $request->string('order_number')->toString(),
            $request->string('email')->toString(),
        );

        return new OrderTrackingResource($order);
    }
}
