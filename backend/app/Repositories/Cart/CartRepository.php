<?php

declare(strict_types=1);

namespace App\Repositories\Cart;

use App\Enums\ShippingMethod;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * @extends BaseRepository<Cart>
 */
final class CartRepository extends BaseRepository
{
    protected string $model = Cart::class;

    /** What a new cart starts with (the template pre-selects Local Delivery). */
    public const ShippingMethod DEFAULT_SHIPPING_METHOD = ShippingMethod::LocalDelivery;

    public function findGuestCart(string $token): ?Cart
    {
        return $this->query()->whereNull('user_id')->where('token', $token)->first();
    }

    public function findForUser(User $user): ?Cart
    {
        return $this->query()->whereBelongsTo($user)->first();
    }

    /**
     * An unsaved, empty cart: what a visitor without a cart sees. Reads never
     * create rows; the first write does (createForGuest / createForUser).
     */
    public function newEmpty(?User $user = null): Cart
    {
        $cart = new Cart([
            'user_id' => $user?->id,
            'shipping_method' => self::DEFAULT_SHIPPING_METHOD,
            'notices' => [],
        ]);

        return $cart->setRelation('items', new Collection)->setRelation('coupon', null);
    }

    public function createForGuest(): Cart
    {
        return $this->create([
            'token' => (string) Str::uuid(),
            'shipping_method' => self::DEFAULT_SHIPPING_METHOD,
            'notices' => [],
        ]);
    }

    public function createForUser(User $user): Cart
    {
        return $this->create([
            'user_id' => $user->id,
            'shipping_method' => self::DEFAULT_SHIPPING_METHOD,
            'notices' => [],
        ]);
    }

    /**
     * Re-reads the cart row with a row lock (SELECT … FOR UPDATE) so concurrent
     * writes to the same cart run one after the other. Call inside a transaction.
     */
    public function lock(Cart $cart): Cart
    {
        return $this->query()->whereKey($cart->id)->lockForUpdate()->firstOrFail();
    }

    /** Loads what pricing and the Cart resource need: items with products, and the coupon. */
    public function loadForSummary(Cart $cart): Cart
    {
        return $cart->load(['items.product.primaryImage', 'coupon']);
    }

    /** An item of this cart; another cart's item is "not found" (404), never revealed. */
    public function findItem(Cart $cart, int $itemId): CartItem
    {
        return $cart->items()->whereKey($itemId)->firstOrFail();
    }
}
