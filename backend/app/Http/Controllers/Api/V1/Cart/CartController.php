<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Actions\Cart\EmptyCart;
use App\Actions\Cart\SummarizeCart;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Cart\CartResource;
use App\Services\Cart\CartResolver;

/** The visitor's cart as a whole: `GET /cart` and `DELETE /cart`. */
final class CartController extends Controller
{
    public function __construct(
        private readonly CartResolver $carts,
        private readonly SummarizeCart $summarize,
    ) {}

    public function show(): CartResource
    {
        return new CartResource($this->summarize->handle($this->carts->current()));
    }

    public function destroy(EmptyCart $emptyCart): CartResource
    {
        $cart = $this->carts->current();
        $emptyCart->handle($cart);

        return new CartResource($this->summarize->handle($cart));
    }
}
