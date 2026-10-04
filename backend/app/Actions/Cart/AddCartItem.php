<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Exceptions\CartException;
use App\Models\Cart;
use App\Models\Product;
use App\Repositories\Cart\CartRepository;
use Illuminate\Support\Facades\DB;

/**
 * Puts a product in the cart. If it is already there the quantities are
 * added; when the total would exceed the stock nothing changes (422).
 */
final readonly class AddCartItem
{
    public function __construct(
        private CartRepository $carts,
        private CheckStock $checkStock,
    ) {}

    /** @throws CartException */
    public function handle(Cart $cart, Product $product, int $quantity): void
    {
        DB::transaction(function () use ($cart, $product, $quantity): void {
            // Lock the cart so two quick "Add to bag" clicks are applied one after the other.
            $cart = $this->carts->lock($cart);
            $item = $cart->items()->where('product_id', $product->id)->first();
            $newQuantity = ($item->quantity ?? 0) + $quantity;

            $this->checkStock->ensureAvailable($product, $newQuantity);

            if ($item !== null) {
                $item->update(['quantity' => $newQuantity]);
            } else {
                $cart->items()->create(['product_id' => $product->id, 'quantity' => $newQuantity]);
            }

            $cart->touch();
        });
    }
}
