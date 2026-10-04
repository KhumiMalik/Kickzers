<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\DTOs\Cart\ShippingOption;
use App\Models\Cart;
use App\Models\CartItem;

/**
 * Brings a stored cart in line with today's catalog before it is shown or
 * checked out, and records a notice for every change (shown once as a toast):
 *
 * - products that can no longer be bought are removed;
 * - quantities above the stock are lowered;
 * - a shipping method the destination cannot use is replaced by the cheapest one;
 * - a coupon that stopped qualifying is removed.
 *
 * Needs `items.product` and `coupon` loaded (CartRepository::loadForSummary).
 */
final readonly class ReconcileCart
{
    public function __construct(private CheckCoupon $checkCoupon) {}

    /** @param  list<ShippingOption>  $shippingOptions  the options for the cart's destination */
    public function handle(Cart $cart, array $shippingOptions): void
    {
        $notices = $cart->pendingNotices();

        $this->reconcileItems($cart, $notices);
        $this->reconcileShipping($cart, $shippingOptions, $notices);
        $this->reconcileCoupon($cart, $notices);

        $cart->notices = $notices;

        if ($cart->isDirty()) {
            $cart->save();
        }
    }

    /** @param  list<string>  $notices */
    private function reconcileItems(Cart $cart, array &$notices): void
    {
        $kept = $cart->items->filter(function (CartItem $item) use (&$notices): bool {
            $product = $item->product;

            if ($product === null || ! $product->isPurchasable()) {
                $name = $product === null ? 'A product' : $product->name;
                $notices[] = "{$name} is no longer available and was removed from your cart.";
                $item->delete();

                return false;
            }

            $max = $product->maxPurchasableQuantity();

            if ($item->quantity > $max) {
                $item->update(['quantity' => $max]);
                $notices[] = "{$product->name}: quantity reduced to {$max} (stock changed).";
            }

            return true;
        });

        $cart->setRelation('items', $kept->values());
    }

    /**
     * @param  list<ShippingOption>  $shippingOptions
     * @param  list<string>  $notices
     */
    private function reconcileShipping(Cart $cart, array $shippingOptions, array &$notices): void
    {
        foreach ($shippingOptions as $option) {
            if ($option->method === $cart->shipping_method) {
                return;
            }
        }

        $cheapest = null;
        foreach ($shippingOptions as $option) {
            if ($cheapest === null || $option->price < $cheapest->price) {
                $cheapest = $option;
            }
        }

        if ($cart->shipping_method !== null && $cheapest !== null) {
            $notices[] = "Shipping changed to {$cheapest->method->label()}: the previous method is not available for your destination.";
        }

        $cart->shipping_method = $cheapest?->method;
    }

    /** @param  list<string>  $notices */
    private function reconcileCoupon(Cart $cart, array &$notices): void
    {
        $coupon = $cart->coupon;

        if ($coupon === null) {
            return;
        }

        $subtotal = $cart->items->sum(fn (CartItem $item): int => ($item->product->price ?? 0) * $item->quantity);
        $violation = $this->checkCoupon->violation($coupon, $subtotal);

        if ($violation !== null) {
            $notices[] = "Coupon {$coupon->code} was removed: {$violation->getMessage()}";
            $cart->coupon()->dissociate();
        }
    }
}
