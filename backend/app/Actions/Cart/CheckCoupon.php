<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Exceptions\CartException;
use App\Models\Coupon;

/**
 * The rules that decide whether a coupon can be used for a subtotal (minor
 * units). Used when applying a code and on every cart read (a coupon can
 * stop qualifying when items are removed or it expires).
 */
final class CheckCoupon
{
    /** The rule the coupon breaks, or null when it can be used. */
    public function violation(?Coupon $coupon, int $subtotal): ?CartException
    {
        return match (true) {
            $coupon === null, ! $coupon->is_active => CartException::invalidCoupon(),
            $coupon->starts_at !== null && $coupon->starts_at->isFuture() => CartException::couponNotStarted(),
            $coupon->expires_at !== null && $coupon->expires_at->isPast() => CartException::couponExpired(),
            $coupon->max_uses !== null && $coupon->times_used >= $coupon->max_uses => CartException::couponUsedUp(),
            $coupon->min_subtotal !== null && $subtotal < $coupon->min_subtotal => CartException::couponMinimumNotMet($coupon->min_subtotal),
            default => null,
        };
    }

    /** @throws CartException */
    public function ensureUsable(?Coupon $coupon, int $subtotal): Coupon
    {
        $violation = $this->violation($coupon, $subtotal);

        if ($violation !== null || $coupon === null) {
            throw $violation ?? CartException::invalidCoupon();
        }

        return $coupon;
    }
}
