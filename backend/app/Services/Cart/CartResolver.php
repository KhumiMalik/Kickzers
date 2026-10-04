<?php

declare(strict_types=1);

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\User;
use App\Repositories\Cart\CartRepository;
use Illuminate\Http\Request;

/**
 * Finds the cart of the current visitor: the user's cart when logged in,
 * otherwise the guest cart named by the cart cookie. Controllers ask for it;
 * the cart Actions then work on the Cart model and never look at the request.
 */
final readonly class CartResolver
{
    public function __construct(
        private Request $request,
        private CartRepository $carts,
        private CartCookie $cookie,
    ) {}

    /** The visitor's cart, or an unsaved empty one. Never writes. */
    public function current(): Cart
    {
        $user = $this->user();

        if ($user !== null) {
            return $this->carts->findForUser($user) ?? $this->carts->newEmpty($user);
        }

        $token = $this->cookie->token($this->request);
        $cart = $token === null ? null : $this->carts->findGuestCart($token);

        return $cart ?? $this->carts->newEmpty();
    }

    /** The visitor's cart, created on the first write (a guest also gets the cookie). */
    public function currentOrCreate(): Cart
    {
        $cart = $this->current();

        if ($cart->exists) {
            return $cart;
        }

        $user = $this->user();

        if ($user !== null) {
            return $this->carts->createForUser($user);
        }

        $cart = $this->carts->createForGuest();
        $this->cookie->queue((string) $cart->token);

        return $cart;
    }

    private function user(): ?User
    {
        $user = $this->request->user();

        return $user instanceof User ? $user : null;
    }
}
