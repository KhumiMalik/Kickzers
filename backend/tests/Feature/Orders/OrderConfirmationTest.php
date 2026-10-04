<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\User;

beforeEach(function (): void {
    $this->order = Order::factory()->has(OrderItem::factory(), 'items')->create();
    OrderAddress::factory()->for($this->order)->create();
    OrderAddress::factory()->for($this->order)->shipping()->create();
});

it('shows the order to the browser session that placed it', function (): void {
    $this->withSession(['placed_orders' => [$this->order->number]])
        ->getJson(route('api.v1.orders.show', $this->order))
        ->assertOk()
        ->assertJsonPath('data.number', $this->order->number)
        ->assertJsonCount(1, 'data.items');
});

it('shows the order to the account that owns it', function (): void {
    $user = User::factory()->create();
    $this->order->update(['user_id' => $user->id]);

    $this->actingAs($user)->getJson(route('api.v1.orders.show', $this->order))->assertOk();
});

it('forbids everyone else', function (): void {
    $this->getJson(route('api.v1.orders.show', $this->order))->assertForbidden();
    $this->actingAs(User::factory()->create())->getJson(route('api.v1.orders.show', $this->order))->assertForbidden();
    $this->withSession(['placed_orders' => ['KZ-2026-999999']])->getJson(route('api.v1.orders.show', $this->order))->assertForbidden();
});

it('answers 404 for an unknown order number', function (): void {
    $this->getJson(route('api.v1.orders.show', 'KZ-2026-999999'))
        ->assertNotFound()
        ->assertExactJson(['message' => 'Order not found.']);
});
