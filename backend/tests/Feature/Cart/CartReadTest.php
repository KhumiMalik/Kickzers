<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    // Cart cookies are only read and written for SPA requests, and JSON test requests
    // only send cookies with credentials (like fetch(..., { credentials: "include" })).
    $this->withHeaders(spaHeaders())->withCredentials();
});

it('shows an empty cart to a new visitor without creating one', function (): void {
    $this->getJson(route('api.v1.cart.show'))
        ->assertOk()
        ->assertExactJson(['data' => [
            'items' => [],
            'item_count' => 0,
            'coupon' => null,
            'shipping_method' => 'local_delivery',
            'shipping_methods' => [
                ['code' => 'flat_rate_5', 'name' => 'Flat Rate', 'price' => 500],
                ['code' => 'free', 'name' => 'Free Shipping', 'price' => 0],
                ['code' => 'flat_rate_10', 'name' => 'Flat Rate', 'price' => 1000],
                ['code' => 'local_delivery', 'name' => 'Local Delivery', 'price' => 200],
            ],
            'destination' => ['country' => null, 'state' => null, 'postcode' => null],
            'totals' => ['subtotal' => 0, 'discount' => 0, 'shipping' => 0, 'total' => 0],
            'currency' => 'USD',
            'notices' => [],
        ]])
        ->assertCookieMissing(CartCookie::NAME);

    expect(Cart::query()->count())->toBe(0);
});

it('finds a guest cart through the cart cookie and prices it', function (): void {
    $cart = Cart::factory()->create();
    $product = Product::factory()->priced(7500)->create();
    CartItem::factory()->for($cart)->for($product)->quantity(2)->create();

    $response = $this->withCookie(CartCookie::NAME, $cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertOk()
        ->assertJsonPath('data.item_count', 2)
        ->assertJsonPath('data.items.0.product.slug', $product->slug)
        ->assertJsonPath('data.items.0.unit_price', 7500)
        ->assertJsonPath('data.items.0.line_total', 15000)
        ->assertJsonPath('data.items.0.max_quantity', 25)
        ->assertJsonPath('data.totals', ['subtotal' => 15000, 'discount' => 0, 'shipping' => 200, 'total' => 15200]);

    expect($response->json('data.items.0.id'))->toBe($cart->items()->value('id'));
});

it('ignores a cookie that is unknown or not a cart token', function (string $cookie): void {
    Cart::factory()->create();

    $this->withCookie(CartCookie::NAME, $cookie)->getJson(route('api.v1.cart.show'))->assertJsonPath('data.items', []);
})->with(['3f1d2a64-0000-4000-8000-000000000000', 'not-a-uuid']);

it('uses the account cart for a logged-in customer and never a guest cookie', function (): void {
    $user = User::factory()->create();
    $userCart = Cart::factory()->forUser($user)->create();
    CartItem::factory()->for($userCart)->quantity(3)->create();
    $guestCart = Cart::factory()->create();
    CartItem::factory()->for($guestCart)->create();

    $this->actingAs($user)
        ->withCookie(CartCookie::NAME, $guestCart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonPath('data.item_count', 3);
});

it('removes products that can no longer be bought and says so once', function (): void {
    $cart = Cart::factory()->create();
    $kept = Product::factory()->create();
    $gone = Product::factory()->create(['name' => 'Gel Blaze Running Shoe']);
    CartItem::factory()->for($cart)->for($kept)->create();
    CartItem::factory()->for($cart)->for($gone)->create();
    $gone->update(['status' => 'draft']);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonCount(1, 'data.items')
        ->assertJsonPath('data.notices', ['Gel Blaze Running Shoe is no longer available and was removed from your cart.']);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonPath('data.notices', []);
});

it('lowers a quantity the stock can no longer cover', function (): void {
    $cart = Cart::factory()->create();
    $product = Product::factory()->withStock(10)->create(['name' => 'Suede Classic Low']);
    $item = CartItem::factory()->for($cart)->for($product)->quantity(8)->create();
    $product->update(['stock_quantity' => 3]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonPath('data.items.0.quantity', 3)
        ->assertJsonPath('data.notices', ['Suede Classic Low: quantity reduced to 3 (stock changed).']);

    expect($item->refresh()->quantity)->toBe(3);
});

it('removes a coupon that stopped qualifying', function (): void {
    $coupon = Coupon::factory()->create(['code' => 'SPRING', 'expires_at' => now()->subMinute()]);
    $cart = Cart::factory()->withCoupon($coupon)->create();
    CartItem::factory()->for($cart)->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->getJson(route('api.v1.cart.show'))
        ->assertJsonPath('data.coupon', null)
        ->assertJsonPath('data.totals.discount', 0)
        ->assertJsonPath('data.notices', ['Coupon SPRING was removed: This coupon has expired.']);
});

it('runs the same number of queries however many items the cart holds', function (): void {
    $cart = Cart::factory()->withCoupon(Coupon::factory()->create())->create();
    CartItem::factory()->for($cart)->create();
    $few = queryCount(fn () => $this->withCookie(CartCookie::NAME, $cart->token)->getJson(route('api.v1.cart.show'))->assertOk());

    CartItem::factory()->count(8)->for($cart)->create();
    $many = queryCount(fn () => $this->withCookie(CartCookie::NAME, $cart->token)->getJson(route('api.v1.cart.show'))->assertOk());

    expect($many)->toBe($few);
});
