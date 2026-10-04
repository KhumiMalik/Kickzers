<?php

declare(strict_types=1);

use App\Events\ContactMessageReceived;
use App\Listeners\NotifyAdminOfContactMessage;
use App\Models\ContactMessage;
use App\Notifications\ContactMessageNotification;
use Illuminate\Events\CallQueuedListener;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;

/** @return array<string, string> */
function contactForm(array $overrides = []): array
{
    return ['name' => 'Ana Torres', 'email' => 'Ana@Example.com', 'subject' => 'Sizing', 'message' => 'Do you ship to Wales?', ...$overrides];
}

it('stores the message and queues the admin notification', function (): void {
    Queue::fake();

    $this->postJson(route('api.v1.contact'), contactForm())
        ->assertCreated()
        ->assertExactJson(['message' => 'Your message has been sent.']);

    expect(ContactMessage::query()->sole())
        ->email->toBe('ana@example.com')
        ->ip_address->toBe('127.0.0.1');
    Queue::assertPushed(CallQueuedListener::class, fn (CallQueuedListener $job): bool => $job->class === NotifyAdminOfContactMessage::class);
});

it('e-mails the message to the shop admin with the visitor as reply-to', function (): void {
    Notification::fake();
    config(['shop.admin_email' => 'owner@kickzers.test']);
    $message = ContactMessage::factory()->create(['name' => 'Ana Torres', 'email' => 'ana@example.com', 'subject' => 'Sizing']);

    (new NotifyAdminOfContactMessage)->handle(new ContactMessageReceived($message));

    Notification::assertSentOnDemand(
        ContactMessageNotification::class,
        function (ContactMessageNotification $notification, array $channels, AnonymousNotifiable $notifiable): bool {
            $mail = $notification->toMail($notifiable);

            return $notifiable->routes['mail'] === 'owner@kickzers.test'
                && $mail->subject === 'New contact message: Sizing'
                && $mail->replyTo === [['ana@example.com', 'Ana Torres']];
        },
    );
});

it('validates the form', function (): void {
    $this->postJson(route('api.v1.contact'), ['email' => 'nope', 'message' => str_repeat('a', 5001)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

    expect(ContactMessage::query()->count())->toBe(0);
});
