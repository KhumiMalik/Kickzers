<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\DTOs\Cart\CartLine;
use App\DTOs\Cart\CartTotals;
use App\DTOs\Cart\ShippingOption;
use App\Enums\CouponType;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use LogicException;

/**
 * All cart money maths, in integer minor units (no floats, so no rounding
 * drift). Needs `items.product` and `coupon` loaded.
 *
 * - Line total = current product price × quantity.
 * - Percent coupons round half up to the cent; fixed coupons are capped at
 *   the subtotal. Discounts never apply to shipping.
 * - Shipping is free for an empty cart.
 */
final class CalculateCartTotals
{
    /**
     * @param  list<ShippingOption>  $shippingOptions  the options for the cart's destination
     */
    public function handle(Cart $cart, array $shippingOptions): CartTotals
    {
        $lines = [];
        $subtotal = 0;
        $itemCount = 0;

        foreach ($cart->items as $item) {
            $line = $this->line($item);
            $lines[] = $line;
            $subtotal += $line->lineTotal;
            $itemCount += $item->quantity;
        }

        $discount = $this->discount($cart->coupon, $subtotal);
        $shipping = $lines === [] ? 0 : $this->shippingPrice($cart, $shippingOptions);

        return new CartTotals(
            lines: $lines,
            subtotal: $subtotal,
            discount: $discount,
            shipping: $shipping,
            total: $subtotal - $discount + $shipping,
            itemCount: $itemCount,
        );
    }

    public function discount(?Coupon $coupon, int $subtotal): int
    {
        if ($coupon === null) {
            return 0;
        }

        return match ($coupon->type) {
            // intdiv(x + 50, 100) is "round half up" for whole cents.
            CouponType::Percent => intdiv($subtotal * $coupon->value + 50, 100),
            CouponType::Fixed => min($coupon->value, $subtotal),
        };
    }

    private function line(CartItem $item): CartLine
    {
        // product_id cascades on delete, so an item always has its product.
        $product = $item->product ?? throw new LogicException("Cart item {$item->id} has no product.");

        return new CartLine($item, $product, $product->price, $product->price * $item->quantity);
    }

    /** @param  list<ShippingOption>  $shippingOptions */
    private function shippingPrice(Cart $cart, array $shippingOptions): int
    {
        foreach ($shippingOptions as $option) {
            if ($option->method === $cart->shipping_method) {
                return $option->price;
            }
        }

        return 0;
    }
}
