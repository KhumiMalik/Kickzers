<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Order;
use App\Services\Money;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** The "Thank you, your order has been received" e-mail (markdown template). */
final class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your '.config('app.name')." order {$this->order->number}",
        );
    }

    public function content(): Content
    {
        $order = $this->order->loadMissing(['items', 'billingAddress', 'shippingAddress']);
        $frontendUrl = rtrim(config()->string('shop.frontend_url'), '/');

        return new Content(
            markdown: 'mail.orders.confirmation',
            with: [
                'order' => $order,
                'money' => Money::format(...),
                // The confirmation page opens for the browser that ordered (or the account owner);
                // anyone else is pointed to the tracking form.
                'orderUrl' => "{$frontendUrl}/confirmation?order={$order->number}",
                'trackingUrl' => "{$frontendUrl}/tracking",
            ],
        );
    }
}
