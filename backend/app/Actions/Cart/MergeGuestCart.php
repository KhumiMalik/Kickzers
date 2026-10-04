<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use App\Repositories\Cart\CartRepository;
use Illuminate\Support\Facades\DB;

/**
 * Runs right after login or registration: the guest cart joins the
 * customer's cart (contract §1.4).
 *
 * - No account cart yet: the guest cart simply becomes the account's cart.
 * - Otherwise quantities of the same product are added, capped at what can
 *   be bought; products that can no longer be bought are dropped; the guest
 *   coupon is kept only when the account cart has none. The guest cart is
 *   then deleted.
 *
 * The caller clears the cart cookie.
 */
final readonly class MergeGuestCart
{
    public function __construct(private CartRepository $carts) {}

    public function handle(User $user, ?string $guestToken): void
    {
        $guestCart = $guestToken === null ? null : $this->carts->findGuestCart($guestToken);

        if ($guestCart === null) {
            return;
        }

        DB::transaction(function () use ($user, $guestCart): void {
            $userCart = $this->carts->findForUser($user);

            if ($userCart === null) {
                $guestCart->update(['user_id' => $user->id, 'token' => null]);

                return;
            }

            $userCart = $this->carts->lock($userCart);
            $guestCart->load('items.product');

            foreach ($guestCart->items as $guestItem) {
                $this->mergeItem($userCart, $guestItem);
            }

            if ($userCart->coupon_id === null && $guestCart->coupon_id !== null) {
                $userCart->update(['coupon_id' => $guestCart->coupon_id]);
            }

            $guestCart->delete();
        });
    }

    private function mergeItem(Cart $userCart, CartItem $guestItem): void
    {
        $product = $guestItem->product;

        if ($product === null || ! $product->isPurchasable()) {
            return;
        }

        $existing = $userCart->items()->where('product_id', $product->id)->first();
        $quantity = min(($existing->quantity ?? 0) + $guestItem->quantity, $product->maxPurchasableQuantity());

        if ($existing !== null) {
            $existing->update(['quantity' => $quantity]);
        } else {
            $userCart->items()->create(['product_id' => $product->id, 'quantity' => $quantity]);
        }
    }
}
