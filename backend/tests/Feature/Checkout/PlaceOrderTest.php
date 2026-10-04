<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPlaced;
use App\Models\Cart;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingRate;
use App\Models\User;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    Event::fake([OrderPlaced::class]);
    $this->withHeaders(spaHeaders())->withCredentials();
});

it('places the order and returns it with 201', function (): void {
    $shoe = Product::factory()->priced(7500)->withStock(10)->create(['name' => 'Suede Classic Low', 'slug' => 'suede-classic-low']);
    $cart = guestCartWith([$shoe], 2);

    $response = $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload(['notes' => 'Leave at the door']))
        ->assertCreated()
        ->assertJsonPath('data.status', 'processing')
        ->assertJsonPath('data.status_label', 'Processing')
        ->assertJsonPath('data.payment_status', 'unpaid')
        ->assertJsonPath('data.email', 'jane@example.com')
        ->assertJsonPath('data.items', [[
            'product_slug' => 'suede-classic-low', 'name' => 'Suede Classic Low', 'unit_price' => 7500, 'quantity' => 2, 'line_total' => 15000,
        ]])
        ->assertJsonPath('data.shipping_method', ['code' => 'local_delivery', 'name' => 'Local Delivery', 'price' => 200])
        ->assertJsonPath('data.payment_method', ['code' => 'cash_on_delivery', 'name' => 'Cash on delivery'])
        ->assertJsonPath('data.totals', ['subtotal' => 15000, 'discount' => 0, 'shipping' => 200, 'total' => 15200])
        ->assertJsonPath('data.billing_address.country_name', 'United States')
        ->assertJsonPath('data.shipping_address.address_line_1', '12 Mall Road')
        ->assertJsonMissingPath('data.shipping_address.email')
        ->assertJsonPath('data.notes', 'Leave at the door');

    $order = Order::query()->sole();
    expect($response->json('data.number'))->toBe(sprintf('KZ-%d-%06d', now()->year, $order->id))
        ->and($order->user_id)->toBeNull()
        ->and($shoe->refresh()->stock_quantity)->toBe(8)
        ->and($cart->items()->count())->toBe(0);

    Event::assertDispatched(OrderPlaced::class, fn (OrderPlaced $event): bool => $event->order->is($order));
});

it('remembers the order in the session so this browser can open the confirmation', function (): void {
    $cart = guestCartWith([Product::factory()->create()]);

    $number = $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertCreated()
        ->json('data.number');

    expect(session('placed_orders'))->toBe([$number]);
});

it('applies the coupon, records its use and keeps the shipping method and destination', function (): void {
    $coupon = Coupon::query()->where('code', 'KICKZERS10')->sole();
    $coupon->update(['times_used' => 4]);
    $cart = guestCartWith([Product::factory()->priced(10000)->create()]);
    $cart->update(['coupon_id' => $coupon->id, 'shipping_method' => 'flat_rate_10', 'destination_country' => 'US']);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload())
        ->assertCreated()
        ->assertJsonPath('data.coupon_code', 'KICKZERS10')
        ->assertJsonPath('data.totals', ['subtotal' => 10000, 'discount' => 1000, 'shipping' => 1000, 'total' => 10000]);

    $order = Order::query()->sole();
    expect($coupon->refresh()->times_used)->toBe(5)
        ->and($order->couponRedemption?->discount_amount)->toBe(1000)
        ->and($cart->refresh())
        ->coupon_id->toBeNull()
        ->shipping_method->value->toBe('flat_rate_10')
        ->destination_country->toBe('US');
});

it('ships to a different address priced for that country', function (): void {
    ShippingRate::factory()->forCountry(Country::query()->findOrFail('PK'))->create(['method' => 'flat_rate_10', 'price' => 2500]);
    $cart = guestCartWith([Product::factory()->priced(5000)->create()]);
    $cart->update(['shipping_method' => 'flat_rate_10']);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload([
            'ship_to_different_address' => true,
            'shipping_address' => [
                'first_name' => 'Ali', 'last_name' => 'Khan', 'country' => 'pk', 'state' => 'Punjab',
                'city' => 'Lahore', 'address_line_1' => '5 Canal Road', 'postcode' => '54000',
            ],
        ]))
        ->assertCreated()
        ->assertJsonPath('data.shipping_address.first_name', 'Ali')
        ->assertJsonPath('data.shipping_address.country', 'PK')
        ->assertJsonPath('data.shipping_address.country_name', 'Pakistan')
        ->assertJsonPath('data.billing_address.first_name', 'Jane')
        ->assertJsonPath('data.totals.shipping', 2500);
});

it('lets the check gateway decide the order status', function (): void {
    $cart = guestCartWith([Product::factory()->create()]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload(['payment_method' => 'check']))
        ->assertCreated()
        ->assertJsonPath('data.payment_method.code', 'check');

    expect(Order::query()->sole())
        ->status->toBe(OrderStatus::Pending)
        ->payment_status->toBe(PaymentStatus::Unpaid);
});

it('links a logged-in customer\'s order to the account and defaults the e-mail', function (): void {
    $user = User::factory()->create(['email' => 'sam@example.com']);
    $product = Product::factory()->create();
    $cart = Cart::factory()->forUser($user)->create();
    $cart->items()->create(['product_id' => $product->id, 'quantity' => 1]);

    $this->actingAs($user)
        ->withHeader('Idempotency-Key', (string) Str::uuid())
        ->postJson(route('api.v1.checkout'), checkoutPayload(['billing' => ['email' => '']]))
        ->assertCreated()
        ->assertJsonPath('data.email', 'sam@example.com');

    expect(Order::query()->sole()->user_id)->toBe($user->id);
    $this->actingAs($user)->getJson(route('api.v1.account.orders.index'))->assertJsonCount(1, 'data');
});
