<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use Illuminate\Support\Facades\DB;

/**
 * Creates a customer account and logs it in.
 *
 * Fires Laravel's Registered event so features such as e-mail verification
 * can be added later without touching this class. The guest cart and
 * wishlist are merged by the callers of the session (Phase 8 / frontend).
 */
final readonly class RegisterUser
{
    public function __construct(private AuthFactory $auth) {}

    public function handle(string $name, string $email, string $password): User
    {
        $user = DB::transaction(fn (): User => User::query()->create([
            'name' => $name,
            'email' => $email,
            // Hashed by the "hashed" cast on User.
            'password' => $password,
        ]));

        event(new Registered($user));

        $this->auth->guard('web')->login($user);

        return $user;
    }
}
