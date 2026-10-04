<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Actions\Cart\AddCartItem;
use App\Actions\Cart\RemoveCartItem;
use App\Actions\Cart\SummarizeCart;
use App\Actions\Cart\UpdateCartItem;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\AddCartItemRequest;
use App\Http\Requests\Api\V1\Cart\UpdateCartItemRequest;
use App\Http\Resources\Api\V1\Cart\CartResource;
use App\Repositories\Cart\CartRepository;
use App\Repositories\Catalog\ProductRepository;
use App\Services\Cart\CartResolver;

/**
 * Cart lines. Item ids are looked up inside the visitor's own cart, so an
 * id from someone else's cart is simply "Cart item not found." (404).
 */
final class CartItemController extends Controller
{
    public function __construct(
        private readonly CartResolver $resolver,
        private readonly CartRepository $carts,
        private readonly SummarizeCart $summarize,
    ) {}

    public function store(AddCartItemRequest $request, ProductRepository $products, AddCartItem $addCartItem): CartResource
    {
        $cart = $this->resolver->currentOrCreate();
        $addCartItem->handle($cart, $products->findOrFail($request->productId()), $request->quantity());

        return new CartResource($this->summarize->handle($cart));
    }

    public function update(UpdateCartItemRequest $request, int $itemId, UpdateCartItem $updateCartItem): CartResource
    {
        $cart = $this->resolver->current();
        $updateCartItem->handle($this->carts->findItem($cart, $itemId), $request->quantity());

        return new CartResource($this->summarize->handle($cart));
    }

    public function destroy(int $itemId, RemoveCartItem $removeCartItem): CartResource
    {
        $cart = $this->resolver->current();
        $removeCartItem->handle($this->carts->findItem($cart, $itemId));

        return new CartResource($this->summarize->handle($cart));
    }
}
