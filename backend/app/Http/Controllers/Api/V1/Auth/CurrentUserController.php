<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Auth\UserResource;
use App\Models\User;
use Illuminate\Container\Attributes\CurrentUser;

/**
 * `GET /auth/user`: who is logged in. Guests get 401 from the auth:sanctum
 * middleware, which the frontend reads as "not logged in".
 */
final class CurrentUserController extends Controller
{
    public function __invoke(#[CurrentUser] User $user): UserResource
    {
        return new UserResource($user);
    }
}
