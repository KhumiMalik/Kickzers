<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Orders;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A row of the account order history (contract §2.8 OrderSummary).
 * Needs `withSum('items', 'quantity')` (OrderRepository::historyFor).
 *
 * @property-read Order $resource
 */
final class OrderSummaryResource extends JsonResource
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
            // SUM() comes back as a string on some drivers, and null for an order without items.
            'item_count' => (int) ($order->items_sum_quantity ?? 0),
            'totals' => ['total' => $order->total],
            'currency' => $order->currency,
        ];
    }
}
