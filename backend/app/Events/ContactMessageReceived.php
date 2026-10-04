<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\ContactMessage;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** A visitor sent the contact form. */
final class ContactMessageReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly ContactMessage $message) {}
}
