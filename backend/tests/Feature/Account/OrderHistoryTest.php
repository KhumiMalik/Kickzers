<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('requires a login', function (string $routeName): void {
    $order = Order::factory()->forUser($this->user)->create();

    $this->getJson(route($routeName, $routeName === 'api.v1.account.orders.show' ? $order : []))->assertUnauthorized();
})->with(['api.v1.account.orders.index', 'api.v1.account.orders.show']);

it('returns an empty history for a new customer', function (): void {
    $this->actingAs($this->user)
        ->getJson(route('api.v1.account.orders.index'))
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.total', 0);
});

it('lists only the customer\'s own orders, newest first, with item counts', function (): void {
    $older = Order::factory()->forUser($this->user)->create(['placed_at' => now()->subDays(2)]);
    $newer = Order::factory()->forUser($this->user)->status(OrderStatus::Shipped)->create(['placed_at' => now()->subDay(), 'total' => 4200]);
    OrderItem::factory()->for($newer)->create(['quantity' => 2]);
    OrderItem::factory()->for($newer)->create(['quantity' => 3]);
    Order::factory()->forUser()->create();
    Order::factory()->create();

    $this->actingAs($this->user)
        ->getJson(route('api.v1.account.orders.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0', [
            'number' => $newer->number,
            'status' => 'shipped',
            'status_label' => 'Shipped',
            'placed_at' => $newer->placed_at->toIso8601ZuluString(),
            'item_count' => 5,
            'totals' => ['total' => 4200],
            'currency' => 'USD',
        ])
        ->assertJsonPath('data.1.number', $older->number)
        ->assertJsonPath('data.1.item_count', 0);
});

it('pages the history, 10 by default and at most 50', function (): void {
    Order::factory()->count(11)->forUser($this->user)->create();

    $this->actingAs($this->user)->getJson(route('api.v1.account.orders.index'))->assertJsonCount(10, 'data');
    $this->actingAs($this->user)->getJson(route('api.v1.account.orders.index', ['per_page' => 51]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['per_page']);
});

it('shows the full order to its owner', function (): void {
    $product = Product::factory()->priced(2500)->create(['slug' => 'aero-knit-running-shoe']);
    $order = Order::factory()->forUser($this->user)->create(['subtotal' => 5000, 'shipping_total' => 1000, 'total' => 6000]);
    OrderItem::factory()->for($order)->forProduct($product, 2)->create();
    OrderAddress::factory()->for($order)->create(['email' => 'jane@example.com', 'country_code' => 'PK', 'country_name' => 'Pakistan']);
    OrderAddress::factory()->for($order)->shipping()->create();

    $this->actingAs($this->user)
        ->getJson(route('api.v1.account.orders.show', $order))
        ->assertOk()
        ->assertJsonPath('data.number', $order->number)
        ->assertJsonPath('data.items.0', [
            'product_slug' => 'aero-knit-running-shoe', 'name' => $product->name, 'unit_price' => 2500, 'quantity' => 2, 'line_total' => 5000,
        ])
        ->assertJsonPath('data.billing_address.email', 'jane@example.com')
        ->assertJsonPath('data.billing_address.country', 'PK')
        ->assertJsonPath('data.billing_address.country_name', 'Pakistan')
        ->assertJsonMissingPath('data.shipping_address.email')
        ->assertJsonPath('data.shipping_method', ['code' => 'flat_rate_10', 'name' => 'Flat Rate', 'price' => 1000])
        ->assertJsonPath('data.payment_method', ['code' => 'cash_on_delivery', 'name' => 'Cash on delivery'])
        ->assertJsonPath('data.payment_status', 'unpaid')
        ->assertJsonPath('data.totals', ['subtotal' => 5000, 'discount' => 0, 'shipping' => 1000, 'total' => 6000]);
});

it('keeps the item snapshot but drops the link when the product was deleted', function (): void {
    $order = Order::factory()->forUser($this->user)->create();
    OrderItem::factory()->for($order)->create(['product_id' => null, 'product_name' => 'Retired Shoe']);

    $this->actingAs($this->user)
        ->getJson(route('api.v1.account.orders.show', $order))
        ->assertJsonPath('data.items.0.product_slug', null)
        ->assertJsonPath('data.items.0.name', 'Retired Shoe');
});

it('forbids other customers\' orders and guest orders', function (): void {
    $someoneElses = Order::factory()->forUser()->create();
    $guestOrder = Order::factory()->create();

    $this->actingAs($this->user)->getJson(route('api.v1.account.orders.show', $someoneElses))->assertForbidden();
    $this->actingAs($this->user)->getJson(route('api.v1.account.orders.show', $guestOrder))->assertForbidden();
});

it('answers 404 for an unknown order number', function (): void {
    $this->actingAs($this->user)
        ->getJson(route('api.v1.account.orders.show', 'KZ-2026-999999'))
        ->assertNotFound()
        ->assertExactJson(['message' => 'Order not found.']);
});

it('runs the same number of queries however many orders are listed', function (): void {
    Order::factory()->forUser($this->user)->create();
    $few = queryCount(fn () => $this->actingAs($this->user)->getJson(route('api.v1.account.orders.index'))->assertOk());

    Order::factory()->count(8)->forUser($this->user)->has(OrderItem::factory()->count(2), 'items')->create();
    $many = queryCount(fn () => $this->actingAs($this->user)->getJson(route('api.v1.account.orders.index'))->assertOk());

    expect($many)->toBe($few);
});
