<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Actions\Cart\SetShippingMethod;
use App\Actions\Cart\SummarizeCart;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\SetShippingMethodRequest;
use App\Http\Resources\Api\V1\Cart\CartResource;
use App\Services\Cart\CartResolver;

/** `PUT /cart/shipping-method`: the radio buttons under the cart totals. */
final class CartShippingMethodController extends Controller
{
    public function __invoke(
        SetShippingMethodRequest $request,
        CartResolver $carts,
        SetShippingMethod $setShippingMethod,
        SummarizeCart $summarize,
    ): CartResource {
        $cart = $carts->currentOrCreate();
        $setShippingMethod->handle($cart, $request->shippingMethod());

        return new CartResource($summarize->handle($cart));
    }
}
