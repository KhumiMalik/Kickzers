<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The admin's copy of a contact form message. "Reply" in the mail client
 * answers the visitor directly (replyTo).
 */
final class ContactMessageNotification extends Notification
{
    public function __construct(public readonly ContactMessage $message) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New contact message: {$this->message->subject}")
            ->replyTo($this->message->email, $this->message->name)
            ->greeting('New message from the contact form')
            ->line("**From:** {$this->message->name} <{$this->message->email}>")
            ->line("**Subject:** {$this->message->subject}")
            ->line($this->message->message);
    }
}
