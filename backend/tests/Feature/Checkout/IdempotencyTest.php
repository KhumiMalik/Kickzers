<?php

declare(strict_types=1);

use App\Events\OrderPlaced;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    Event::fake([OrderPlaced::class]);
    $this->withHeaders(spaHeaders())->withCredentials();
    $this->key = (string) Str::uuid();
});

it('requires a UUID Idempotency-Key header (400)', function (?string $key): void {
    $request = $key === null ? $this : $this->withHeader('Idempotency-Key', $key);

    $request->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertStatus(400)
        ->assertExactJson(['message' => 'The Idempotency-Key header must be a UUID.', 'code' => 'idempotency_key_missing']);
})->with([null, 'abc']);

it('returns the original order with 200 when the same checkout is retried', function (): void {
    $product = Product::factory()->withStock(5)->create();
    $cart = guestCartWith([$product]);

    $first = $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', $this->key)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertCreated();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', $this->key)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertOk()
        ->assertJsonPath('data.number', $first->json('data.number'));

    expect(Order::query()->count())->toBe(1)
        ->and($product->refresh()->stock_quantity)->toBe(4);
    Event::assertDispatchedTimes(OrderPlaced::class, 1);
});

it('answers 409 when another customer reuses the key', function (): void {
    $cart = guestCartWith([Product::factory()->create()]);
    $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', $this->key)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertCreated();

    $this->withHeader('Idempotency-Key', $this->key)
        ->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => ['email' => 'someone-else@example.com']]))
        ->assertConflict()
        ->assertExactJson(['message' => 'This checkout was already submitted.', 'code' => 'idempotency_conflict']);

    $this->actingAs(User::factory()->create())
        ->withHeader('Idempotency-Key', $this->key)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertConflict();
});
