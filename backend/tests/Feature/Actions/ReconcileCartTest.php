<?php

declare(strict_types=1);

use App\Actions\Cart\ReconcileCart;
use App\DTOs\Cart\ShippingOption;
use App\Enums\ShippingMethod;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;

function reconcile(Cart $cart, array $options): Cart
{
    $cart->load(['items.product', 'coupon']);
    app(ReconcileCart::class)->handle($cart, $options);

    return $cart;
}

it('changes nothing and saves nothing for a cart that is still valid', function (): void {
    $cart = Cart::factory()->create(['shipping_method' => ShippingMethod::Free]);
    CartItem::factory()->for($cart)->create();
    $updatedAt = $cart->updated_at;
    $this->travel(1)->minutes();

    reconcile($cart, [new ShippingOption(ShippingMethod::Free, 0)]);

    expect($cart->pendingNotices())->toBe([])
        ->and($cart->refresh()->updated_at->equalTo($updatedAt))->toBeTrue();
});

it('picks the cheapest method (the first one on a tie) when the current one is not offered', function (): void {
    $cart = reconcile(Cart::factory()->create(['shipping_method' => ShippingMethod::LocalDelivery]), [
        new ShippingOption(ShippingMethod::FlatRate5, 500),
        new ShippingOption(ShippingMethod::FlatRate10, 500),
        new ShippingOption(ShippingMethod::Free, 900),
    ]);

    expect($cart->shipping_method)->toBe(ShippingMethod::FlatRate5)
        ->and($cart->pendingNotices())->toBe(['Shipping changed to Flat Rate: the previous method is not available for your destination.']);
});

it('silently chooses a method for a cart that had none', function (): void {
    $cart = reconcile(Cart::factory()->create(['shipping_method' => null]), [new ShippingOption(ShippingMethod::Free, 0)]);

    expect($cart->shipping_method)->toBe(ShippingMethod::Free)
        ->and($cart->pendingNotices())->toBe([]);
});

it('keeps earlier notices that were not shown yet', function (): void {
    $cart = Cart::factory()->create(['notices' => ['Earlier notice.']]);
    $item = CartItem::factory()->for($cart)->for(Product::factory()->create(['name' => 'Gone Shoe']))->create();
    $item->product?->update(['status' => 'draft']);

    reconcile($cart, [new ShippingOption(ShippingMethod::LocalDelivery, 200)]);

    expect($cart->refresh()->pendingNotices())->toBe([
        'Earlier notice.',
        'Gone Shoe is no longer available and was removed from your cart.',
    ]);
});
