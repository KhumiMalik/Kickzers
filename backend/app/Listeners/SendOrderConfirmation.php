<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderConfirmationMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

/**
 * E-mails the order confirmation. Queued (ShouldQueue), so the checkout
 * response never waits for the mail server; a failed send is retried by the
 * queue worker instead of failing the order. Laravel discovers this listener
 * from the type of handle()'s parameter.
 */
final class SendOrderConfirmation implements ShouldQueue
{
    /** Attempts before the job lands in failed_jobs. */
    public int $tries = 3;

    /** Seconds between attempts. */
    public int $backoff = 60;

    public function handle(OrderPlaced $event): void
    {
        Mail::to($event->order->email)->send(new OrderConfirmationMail($event->order));
    }
}
