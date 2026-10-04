<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\RegisterUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\Auth\UserResource;
use Illuminate\Http\JsonResponse;

/** `POST /auth/register`: creates the account and logs it in (201). */
final class RegisteredUserController extends Controller
{
    public function __invoke(RegisterRequest $request, RegisterUser $registerUser): JsonResponse
    {
        $user = $registerUser->handle(
            name: $request->string('name')->toString(),
            email: $request->string('email')->toString(),
            password: $request->string('password')->toString(),
        );

        // A new session id after login prevents session fixation.
        $request->session()->regenerate();

        return (new UserResource($user))->response()->setStatusCode(201);
    }
}
