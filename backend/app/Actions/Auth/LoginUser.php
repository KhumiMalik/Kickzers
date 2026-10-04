<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use Illuminate\Validation\ValidationException;
use LogicException;

/**
 * Checks the credentials and logs the customer in on the session guard.
 *
 * A wrong email and a wrong password give the same message, so the response
 * never reveals which emails have accounts.
 */
final readonly class LoginUser
{
    public function __construct(private AuthFactory $auth) {}

    /** @throws ValidationException when the credentials do not match */
    public function handle(string $email, string $password, bool $remember): User
    {
        $guard = $this->auth->guard('web');

        if (! $guard->attempt(['email' => $email, 'password' => $password], $remember)) {
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        $user = $guard->user();

        if (! $user instanceof User) {
            throw new LogicException('The web guard must authenticate App\Models\User.');
        }

        return $user;
    }
}
