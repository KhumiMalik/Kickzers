<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * An order was placed. Dispatched inside the PlaceOrder transaction but,
 * because of ShouldDispatchAfterCommit, only delivered once it commits: a
 * rolled-back checkout never sends a confirmation e-mail.
 */
final class OrderPlaced implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Order $order) {}
}
