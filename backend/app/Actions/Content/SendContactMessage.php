<?php

declare(strict_types=1);

namespace App\Actions\Content;

use App\Events\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Repositories\Content\ContactMessageRepository;

/**
 * Stores a contact form message and announces it. The admin e-mail is sent by
 * a queued listener, so the visitor never waits for the mail server and a
 * mail outage cannot lose the message (it is already saved).
 */
final readonly class SendContactMessage
{
    public function __construct(private ContactMessageRepository $messages) {}

    public function handle(string $name, string $email, string $subject, string $message, ?string $ipAddress): ContactMessage
    {
        $contactMessage = $this->messages->create([
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'ip_address' => $ipAddress,
        ]);

        ContactMessageReceived::dispatch($contactMessage);

        return $contactMessage;
    }
}
