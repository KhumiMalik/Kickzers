<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ContactMessageReceived;
use App\Notifications\ContactMessageNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;

/**
 * E-mails new contact messages to the shop (config shop.admin_email,
 * SHOP_ADMIN_EMAIL in .env). Queued and retried like the order e-mail.
 */
final class NotifyAdminOfContactMessage implements ShouldQueue
{
    public int $tries = 3;

    public int $backoff = 60;

    public function handle(ContactMessageReceived $event): void
    {
        Notification::route('mail', config()->string('shop.admin_email'))
            ->notify(new ContactMessageNotification($event->message));
    }
}
