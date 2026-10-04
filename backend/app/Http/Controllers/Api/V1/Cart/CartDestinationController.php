<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Actions\Cart\SetDestination;
use App\Actions\Cart\SummarizeCart;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\SetDestinationRequest;
use App\Http\Resources\Api\V1\Cart\CartResource;
use App\Services\Cart\CartResolver;

/** `PUT /cart/destination`: the cart page "Calculate shipping" form. */
final class CartDestinationController extends Controller
{
    public function __invoke(
        SetDestinationRequest $request,
        CartResolver $carts,
        SetDestination $setDestination,
        SummarizeCart $summarize,
    ): CartResource {
        $cart = $carts->currentOrCreate();
        $setDestination->handle($cart, $request->countryCode(), $request->state(), $request->postcode());

        return new CartResource($summarize->handle($cart));
    }
}
