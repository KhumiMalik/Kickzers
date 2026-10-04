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
    $this->withHeaders(spaHeaders())->withCredentials();
});

it('creates a guest cart on the first add and sends the cart cookie', function (): void {
    $product = Product::factory()->priced(5000)->create();

    $response = $this->postJson(route('api.v1.cart.items.store'), ['product_id' => $product->id, 'quantity' => 2])
        ->assertOk()
        ->assertJsonPath('data.items.0.quantity', 2)
        ->assertJsonPath('data.totals.subtotal', 10000)
        ->assertCookie(CartCookie::NAME);

    $cart = Cart::query()->sole();
    expect($response->getCookie(CartCookie::NAME)?->getValue())->toBe($cart->token)
        ->and($cart->user_id)->toBeNull();
});

it('creates the account cart for a logged-in customer, without a cookie', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('api.v1.cart.items.store'), ['product_id' => Product::factory()->create()->id, 'quantity' => 1])
        ->assertOk()
        ->assertCookieMissing(CartCookie::NAME);

    expect(Cart::query()->sole()->user_id)->toBe($user->id);
});

it('adds to the quantity of a product already in the cart', function (): void {
    $cart = Cart::factory()->create();
    $product = Product::factory()->create();
    CartItem::factory()->for($cart)->for($product)->quantity(2)->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.cart.items.store'), ['product_id' => $product->id, 'quantity' => 3])
        ->assertJsonCount(1, 'data.items')
        ->assertJsonPath('data.items.0.quantity', 5);
});

it('refuses more than the stock and leaves the cart unchanged', function (): void {
    $cart = Cart::factory()->create();
    $product = Product::factory()->withStock(4)->create(['name' => 'Aero Knit Running Shoe']);
    CartItem::factory()->for($cart)->for($product)->quantity(3)->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.cart.items.store'), ['product_id' => $product->id, 'quantity' => 2])
        ->assertUnprocessable()
        ->assertExactJson([
            'message' => 'Only 4 of Aero Knit Running Shoe left in stock.',
            'errors' => ['quantity' => ['Only 4 of Aero Knit Running Shoe left in stock.']],
        ]);

    expect($cart->items()->value('quantity'))->toBe(3);
});

it('refuses products that cannot be bought', function (Closure $makeProduct, string $message): void {
    $product = $makeProduct();

    $this->postJson(route('api.v1.cart.items.store'), ['product_id' => $product->id, 'quantity' => 1])
        ->assertUnprocessable()
        ->assertJsonPath('errors.product_id', [$message]);
})->with([
    'coming soon' => [fn () => Product::factory()->comingSoon()->create(['name' => 'Teal Wrap Jumpsuit']), 'Teal Wrap Jumpsuit is coming soon.'],
    'out of stock' => [fn () => Product::factory()->outOfStock()->create(['name' => 'Cami Midi Dress']), 'Cami Midi Dress is out of stock.'],
]);

it('validates the product and quantity', function (array $payload, string $field): void {
    $this->postJson(route('api.v1.cart.items.store'), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);
})->with([
    'draft product' => [fn () => ['product_id' => Product::factory()->draft()->create()->id, 'quantity' => 1], 'product_id'],
    'unknown product' => [['product_id' => 999, 'quantity' => 1], 'product_id'],
    'zero quantity' => [fn () => ['product_id' => Product::factory()->create()->id, 'quantity' => 0], 'quantity'],
    'above 99' => [fn () => ['product_id' => Product::factory()->create()->id, 'quantity' => 100], 'quantity'],
    'missing quantity' => [fn () => ['product_id' => Product::factory()->create()->id], 'quantity'],
]);

it('changes a quantity, within the stock', function (): void {
    $cart = Cart::factory()->create();
    $item = CartItem::factory()->for($cart)->for(Product::factory()->withStock(5))->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->patchJson(route('api.v1.cart.items.update', $item->id), ['quantity' => 4])
        ->assertOk()
        ->assertJsonPath('data.items.0.quantity', 4);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->patchJson(route('api.v1.cart.items.update', $item->id), ['quantity' => 6])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['quantity']);
});

it('removes a line', function (): void {
    $cart = Cart::factory()->create();
    $item = CartItem::factory()->for($cart)->create();
    CartItem::factory()->for($cart)->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->deleteJson(route('api.v1.cart.items.destroy', $item->id))
        ->assertOk()
        ->assertJsonCount(1, 'data.items');
});

it('never touches a line of someone else\'s cart', function (string $method, string $routeName): void {
    $mine = Cart::factory()->create();
    $theirs = CartItem::factory()->for(Cart::factory())->create();

    $this->withCookie(CartCookie::NAME, $mine->token)
        ->json($method, route($routeName, $theirs->id), ['quantity' => 1])
        ->assertNotFound()
        ->assertExactJson(['message' => 'Cart item not found.']);

    expect($theirs->fresh())->not->toBeNull();
})->with([
    'update' => ['PATCH', 'api.v1.cart.items.update'],
    'remove' => ['DELETE', 'api.v1.cart.items.destroy'],
]);

it('empties the cart but keeps the shipping choice and destination', function (): void {
    $cart = Cart::factory()->withCoupon(Coupon::factory()->create())->create([
        'shipping_method' => 'flat_rate_5', 'destination_country' => 'US', 'destination_state' => 'Texas',
    ]);
    CartItem::factory()->count(2)->for($cart)->create();

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->deleteJson(route('api.v1.cart.destroy'))
        ->assertOk()
        ->assertJsonPath('data.items', [])
        ->assertJsonPath('data.coupon', null)
        ->assertJsonPath('data.shipping_method', 'flat_rate_5')
        ->assertJsonPath('data.destination.state', 'Texas')
        ->assertJsonPath('data.totals.total', 0);
});
