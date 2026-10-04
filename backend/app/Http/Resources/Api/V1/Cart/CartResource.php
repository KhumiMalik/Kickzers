<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Cart;

use App\DTOs\Cart\CartLine;
use App\DTOs\Cart\CartSummary;
use App\DTOs\Cart\ShippingOption;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The cart (contract §2.7), returned by every cart endpoint so the frontend
 * replaces its cached copy with it. All amounts come from the server.
 *
 * @property-read CartSummary $resource
 */
final class CartResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $summary = $this->resource;
        $cart = $summary->cart;
        $totals = $summary->totals;

        return [
            'items' => array_map(fn (CartLine $line): array => [
                'id' => $line->item->id,
                'product' => [
                    'id' => $line->product->id,
                    'slug' => $line->product->slug,
                    'name' => $line->product->name,
                    'image' => MediaUrl::for($line->product->primaryImage?->path),
                ],
                'unit_price' => $line->unitPrice,
                'quantity' => $line->item->quantity,
                'line_total' => $line->lineTotal,
                'max_quantity' => $line->product->maxPurchasableQuantity(),
            ], $totals->lines),
            'item_count' => $totals->itemCount,
            'coupon' => $cart->coupon === null ? null : [
                'code' => $cart->coupon->code,
                'description' => $cart->coupon->description,
            ],
            'shipping_method' => $cart->shipping_method?->value,
            'shipping_methods' => array_map(fn (ShippingOption $option): array => [
                'code' => $option->method->value,
                'name' => $option->method->label(),
                'price' => $option->price,
            ], $summary->shippingOptions),
            'destination' => [
                'country' => $cart->destination_country,
                'state' => $cart->destination_state,
                'postcode' => $cart->destination_postcode,
            ],
            'totals' => [
                'subtotal' => $totals->subtotal,
                'discount' => $totals->discount,
                'shipping' => $totals->shipping,
                'total' => $totals->total,
            ],
            'currency' => config('shop.currency'),
            'notices' => $summary->notices,
        ];
    }
}
