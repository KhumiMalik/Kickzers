<?php

declare(strict_types=1);

use App\Events\OrderPlaced;
use App\Listeners\SendOrderConfirmation;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Events\CallQueuedListener;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;

it('queues the confirmation e-mail when an order is placed', function (): void {
    $this->seed(ReferenceDataSeeder::class);
    Queue::fake();
    $cart = guestCartWith([Product::factory()->create()]);

    $this->withHeaders(spaHeaders())->withCredentials()
        ->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertCreated();

    Queue::assertPushed(CallQueuedListener::class, fn (CallQueuedListener $job): bool => $job->class === SendOrderConfirmation::class);
});

it('sends the confirmation to the billing e-mail', function (): void {
    Mail::fake();
    $order = Order::factory()->create(['email' => 'jane@example.com']);

    (new SendOrderConfirmation)->handle(new OrderPlaced($order));

    Mail::assertSent(OrderConfirmationMail::class, fn (OrderConfirmationMail $mail): bool => $mail->hasTo('jane@example.com'));
});

it('lists the items, totals, payment and links in the e-mail', function (): void {
    $order = Order::factory()->create(['subtotal' => 15000, 'discount' => 1500, 'coupon_code' => 'KICKZERS10', 'shipping_total' => 1000, 'total' => 14500]);
    OrderItem::factory()->for($order)->create(['product_name' => 'Suede Classic Low', 'quantity' => 2, 'line_total' => 15000]);
    OrderAddress::factory()->for($order)->create(['first_name' => 'Jane']);
    OrderAddress::factory()->for($order)->shipping()->create(['city' => 'Lahore']);

    $mail = new OrderConfirmationMail($order);

    $mail->assertHasSubject("Your Kickzers order {$order->number}");
    $mail->assertSeeInHtml('Hi Jane')
        ->assertSeeInHtml('Suede Classic Low')
        ->assertSeeInHtml('$150.00')
        ->assertSeeInHtml('KICKZERS10')
        ->assertSeeInHtml('$145.00')
        ->assertSeeInHtml('Cash on delivery')
        ->assertSeeInHtml('Lahore')
        ->assertSeeInHtml("/confirmation?order={$order->number}")
        ->assertSeeInHtml('/tracking');
});
