<?php

declare(strict_types=1);

namespace App\Services\Cart;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

/**
 * The guest cart cookie (contract §1.4): a random UUID that points at the
 * guest's cart row. Laravel encrypts it (EncryptCookies runs for SPA
 * requests) and it is httpOnly, so the frontend never sees or edits it;
 * SameSite=Lax comes from config/session.php.
 */
final class CartCookie
{
    public const string NAME = 'kickzers_cart';

    public const int LIFETIME_MINUTES = 60 * 24 * 30;

    /** The guest's cart token, or null when the cookie is missing or tampered with. */
    public function token(Request $request): ?string
    {
        $token = $request->cookie(self::NAME);

        return is_string($token) && Str::isUuid($token) ? $token : null;
    }

    /** Sends the cookie with the current response. */
    public function queue(string $token): void
    {
        Cookie::queue(Cookie::make(self::NAME, $token, self::LIFETIME_MINUTES, httpOnly: true));
    }

    /** Removes the cookie (after the guest cart was merged into an account). */
    public function forget(): void
    {
        Cookie::queue(Cookie::forget(self::NAME));
    }
}
