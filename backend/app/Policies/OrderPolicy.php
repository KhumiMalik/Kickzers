<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

/**
 * Who may see an order in their account. Guests reach their orders through
 * the confirmation link and the tracking form instead (Phase 9).
 *
 * Laravel finds this policy by naming convention (App\Models\Order →
 * App\Policies\OrderPolicy); no registration is needed.
 */
final class OrderPolicy
{
    /** Only the customer who placed the order (guest orders have no owner). */
    public function view(User $user, Order $order): bool
    {
        return $order->user_id !== null && $order->user_id === $user->id;
    }
}
