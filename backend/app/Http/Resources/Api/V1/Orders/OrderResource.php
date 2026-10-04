<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Orders;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A full order (contract §2.8): confirmation page and account order page.
 * Names and prices are the snapshots taken at checkout. Load it with
 * OrderRepository::loadDetail().
 *
 * @property-read Order $resource
 */
final class OrderResource extends JsonResource
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
            'email' => $order->email,
            'billing_address' => $order->billingAddress === null ? null : new OrderAddressResource($order->billingAddress),
            'shipping_address' => $order->shippingAddress === null ? null : new OrderAddressResource($order->shippingAddress),
            'items' => $order->items->map(fn (OrderItem $item): array => [
                // The product may have been deleted since; the snapshot stays.
                'product_slug' => $item->product_id === null ? null : $item->product_slug,
                'name' => $item->product_name,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'line_total' => $item->line_total,
            ])->all(),
            'coupon_code' => $order->coupon_code,
            'shipping_method' => [
                'code' => $order->shipping_method->value,
                'name' => $order->shipping_method_name,
                'price' => $order->shipping_total,
            ],
            'payment_method' => [
                'code' => $order->payment_method->value,
                'name' => $order->payment_method->label(),
            ],
            'payment_status' => $order->payment_status->value,
            'totals' => [
                'subtotal' => $order->subtotal,
                'discount' => $order->discount,
                'shipping' => $order->shipping_total,
                'total' => $order->total,
            ],
            'currency' => $order->currency,
            'notes' => $order->notes,
        ];
    }
}
