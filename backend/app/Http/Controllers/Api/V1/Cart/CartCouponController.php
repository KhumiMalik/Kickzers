<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Actions\Cart\ApplyCoupon;
use App\Actions\Cart\RemoveCoupon;
use App\Actions\Cart\SummarizeCart;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\ApplyCouponRequest;
use App\Http\Resources\Api\V1\Cart\CartResource;
use App\Services\Cart\CartResolver;

/** The cart coupon: `POST /cart/coupon` and `DELETE /cart/coupon`. */
final class CartCouponController extends Controller
{
    public function __construct(
        private readonly CartResolver $carts,
        private readonly SummarizeCart $summarize,
    ) {}

    public function store(ApplyCouponRequest $request, ApplyCoupon $applyCoupon): CartResource
    {
        $cart = $this->carts->currentOrCreate();
        $applyCoupon->handle($cart, $request->code());

        return new CartResource($this->summarize->handle($cart));
    }

    public function destroy(RemoveCoupon $removeCoupon): CartResource
    {
        $cart = $this->carts->current();
        $removeCoupon->handle($cart);

        return new CartResource($this->summarize->handle($cart));
    }
}
