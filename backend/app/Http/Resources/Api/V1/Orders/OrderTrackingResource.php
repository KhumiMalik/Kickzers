<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Orders;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What the tracking page shows (contract §2.8 OrderTracking). It leaves out
 * addresses and contact details: knowing a number and an e-mail is enough to
 * see the status, not the customer's address. Needs withSum('items', 'quantity').
 *
 * @property-read Order $resource
 */
final class OrderTrackingResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $order = $this->resource;

        return [
            'number' => $order->number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'placed_at' => $order->placed_at->toIso8601ZuluString(),
            // SUM() comes back as a string on some drivers.
            'item_count' => (int) ($order->items_sum_quantity ?? 0),
            'shipping_method' => [
                'code' => $order->shipping_method->value,
                'name' => $order->shipping_method_name,
                'price' => $order->shipping_total,
            ],
            'totals' => ['total' => $order->total],
            'currency' => $order->currency,
        ];
    }
}
