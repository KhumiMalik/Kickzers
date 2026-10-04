<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;

beforeEach(function (): void {
    $this->order = Order::factory()->status(OrderStatus::Shipped)->create(['email' => 'jane@example.com', 'total' => 15200]);
    OrderItem::factory()->for($this->order)->create(['quantity' => 2]);
    OrderItem::factory()->for($this->order)->create(['quantity' => 1]);
});

it('tracks an order by number and billing e-mail, in any letter case', function (): void {
    $this->postJson(route('api.v1.orders.track'), ['order_number' => strtolower($this->order->number), 'email' => ' JANE@example.com '])
        ->assertOk()
        ->assertExactJson(['data' => [
            'number' => $this->order->number,
            'status' => 'shipped',
            'status_label' => 'Shipped',
            'placed_at' => $this->order->placed_at->toIso8601ZuluString(),
            'item_count' => 3,
            'shipping_method' => ['code' => 'flat_rate_10', 'name' => 'Flat Rate', 'price' => 1000],
            'totals' => ['total' => 15200],
            'currency' => 'USD',
        ]]);
});

it('gives the same 404 whether the number or the e-mail is wrong', function (string $number, string $email): void {
    $this->postJson(route('api.v1.orders.track'), ['order_number' => $number, 'email' => $email])
        ->assertNotFound()
        ->assertExactJson(['message' => 'No order matches that order number and billing email.', 'code' => 'order_not_found']);
})->with([
    'wrong e-mail' => [fn () => $this->order->number, 'someone@example.com'],
    'wrong number' => ['KZ-2026-999999', 'jane@example.com'],
]);

it('validates the form', function (): void {
    $this->postJson(route('api.v1.orders.track'), ['email' => 'nope'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['order_number', 'email']);
});

it('allows ten lookups a minute per IP so numbers cannot be guessed quickly', function (): void {
    foreach (range(1, 10) as $attempt) {
        $this->postJson(route('api.v1.orders.track'), ['order_number' => "KZ-2026-00000{$attempt}", 'email' => 'x@example.com'])->assertNotFound();
    }

    $this->postJson(route('api.v1.orders.track'), ['order_number' => $this->order->number, 'email' => 'jane@example.com'])
        ->assertTooManyRequests();
});
