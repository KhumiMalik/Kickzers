<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\LoginUser;
use App\Actions\Auth\LogoutUser;
use App\Actions\Cart\MergeGuestCart;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\Api\V1\Auth\UserResource;
use App\Services\Cart\CartCookie;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The customer's login session: `POST /auth/login` and `POST /auth/logout`. */
final class SessionController extends Controller
{
    public function store(LoginRequest $request, LoginUser $loginUser, MergeGuestCart $mergeGuestCart, CartCookie $cartCookie): UserResource
    {
        $user = $loginUser->handle(
            email: $request->string('email')->toString(),
            password: $request->string('password')->toString(),
            remember: $request->boolean('remember'),
        );

        // A new session id after login prevents session fixation.
        $request->session()->regenerate();

        // What the visitor put in the cart before logging in joins the account's cart.
        $mergeGuestCart->handle($user, $cartCookie->token($request));
        $cartCookie->forget();

        return new UserResource($user);
    }

    public function destroy(Request $request, LogoutUser $logoutUser): Response
    {
        $logoutUser->handle($request->session());

        return response()->noContent();
    }
}
