<?php

declare(strict_types=1);

use App\Events\OrderPlaced;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    Event::fake([OrderPlaced::class]);
    $this->withHeaders(spaHeaders())->withCredentials()->withHeader('Idempotency-Key', (string) Str::uuid());
});

it('refuses an empty cart', function (): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertUnprocessable()
        ->assertExactJson(['message' => 'Your cart is empty.', 'errors' => ['cart' => ['Your cart is empty.']]]);
});

it('refuses a cart whose stock ran out and writes nothing', function (): void {
    $product = Product::factory()->withStock(5)->create(['name' => 'Aero Knit Running Shoe']);
    $cart = guestCartWith([$product], 4);
    $product->update(['stock_quantity' => 2]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.cart', ['Aero Knit Running Shoe has only 2 left in stock.']);

    expect(Order::query()->count())->toBe(0)
        ->and($product->refresh()->stock_quantity)->toBe(2)
        ->and($cart->items()->count())->toBe(1);
    Event::assertNotDispatched(OrderPlaced::class);
});

it('refuses a product that can no longer be bought', function (): void {
    $product = Product::factory()->create(['name' => 'Gel Blaze Running Shoe']);
    $cart = guestCartWith([$product]);
    $product->update(['status' => 'coming_soon']);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertJsonPath('errors.cart', ['Gel Blaze Running Shoe is no longer available.']);
});

it('refuses a shipping method the shipping country cannot use', function (): void {
    // The cart defaults to Local Delivery, which is for the store's country (US) only.
    $cart = guestCartWith([Product::factory()->create()]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => ['country' => 'PK', 'state' => 'Punjab']]))
        ->assertUnprocessable()
        ->assertJsonPath('errors.cart', ['The selected shipping method is not available for Pakistan.']);
});

it('refuses a coupon that stopped qualifying', function (): void {
    $cart = guestCartWith([Product::factory()->create()]);
    $cart->update(['coupon_id' => Coupon::factory()->expired()->create()->id]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.coupon', ['This coupon has expired.']);
});

it('does not let a coupon be used past its limit', function (): void {
    $coupon = Coupon::factory()->create(['max_uses' => 1, 'times_used' => 0]);
    $first = guestCartWith([Product::factory()->create()]);
    $second = guestCartWith([Product::factory()->create()]);
    $first->update(['coupon_id' => $coupon->id]);
    $second->update(['coupon_id' => $coupon->id]);

    $this->withCookie(CartCookie::NAME, $first->token)->postJson(route('api.v1.checkout'), checkoutPayload())->assertCreated();

    $this->withCookie(CartCookie::NAME, $second->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => ['email' => 'other@example.com']]))
        ->assertJsonPath('errors.coupon', ['This coupon has reached its usage limit.']);
});

it('sells the last item only once', function (): void {
    $lastPair = Product::factory()->withStock(1)->create(['name' => 'Retro 574 Suede Runner']);
    $first = guestCartWith([$lastPair]);
    $second = guestCartWith([$lastPair]);

    $this->withCookie(CartCookie::NAME, $first->token)->postJson(route('api.v1.checkout'), checkoutPayload())->assertCreated();

    $this->withCookie(CartCookie::NAME, $second->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => ['email' => 'other@example.com']]))
        ->assertJsonPath('errors.cart', ['Retro 574 Suede Runner is no longer available.']);

    expect($lastPair->refresh()->stock_quantity)->toBe(0);
});

it('is rate limited to ten checkouts a minute', function (): void {
    foreach (range(1, 10) as $attempt) {
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson(route('api.v1.checkout'), checkoutPayload())->assertUnprocessable();
    }

    $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson(route('api.v1.checkout'), checkoutPayload())->assertTooManyRequests();
});
