<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Checkout;

use App\Actions\Cart\MergeGuestCart;
use App\Actions\Checkout\PlaceOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Checkout\CheckoutRequest;
use App\Http\Resources\Api\V1\Orders\OrderResource;
use App\Models\User;
use App\Repositories\Orders\OrderRepository;
use App\Services\Cart\CartCookie;
use App\Services\Cart\CartResolver;
use App\Services\Orders\PlacedOrdersSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * `POST /checkout`: places the order (201), or returns the order this
 * Idempotency-Key already placed (200).
 */
final class CheckoutController extends Controller
{
    public function __invoke(
        CheckoutRequest $request,
        CartResolver $carts,
        PlaceOrder $placeOrder,
        OrderRepository $orders,
        PlacedOrdersSession $placedOrders,
        MergeGuestCart $mergeGuestCart,
        CartCookie $cartCookie,
    ): JsonResponse {
        $customer = $request->user();
        $result = $placeOrder->handle(
            $carts->current(),
            $request->toData(),
            $customer instanceof User ? $customer : null,
        );

        if ($result->createdAccount !== null) {
            // "Create an account?": log the new account in, like registration does.
            Auth::guard('web')->login($result->createdAccount);
            $request->session()->regenerate();
            $mergeGuestCart->handle($result->createdAccount, $cartCookie->token($request));
            $cartCookie->forget();
        }

        // Lets this browser open the confirmation page, also as a guest.
        $placedOrders->remember($result->order);

        return (new OrderResource($orders->loadDetail($result->order)))
            ->response()
            ->setStatusCode($result->replayed ? 200 : 201);
    }
}
