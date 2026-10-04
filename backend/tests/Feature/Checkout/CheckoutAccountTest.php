<?php

declare(strict_types=1);

use App\Events\OrderPlaced;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    Event::fake([OrderPlaced::class, Registered::class]);
    $this->withHeaders(spaHeaders())->withCredentials()->withHeader('Idempotency-Key', (string) Str::uuid());
});

it('creates an account with the order and logs it in', function (): void {
    $cart = guestCartWith([Product::factory()->create()]);

    $this->withCookie(CartCookie::NAME, $cart->token)
        ->postJson(route('api.v1.checkout'), checkoutPayload(['create_account' => true, 'password' => 'secret-password']))
        ->assertCreated();

    $user = User::query()->where('email', 'jane@example.com')->sole();
    expect($user->name)->toBe('Jane Doe')
        ->and(Hash::check('secret-password', $user->password))->toBeTrue()
        ->and(Order::query()->sole()->user_id)->toBe($user->id);
    $this->assertAuthenticatedAs($user, 'web');
    Event::assertDispatched(Registered::class);
});

it('needs a password of at least 8 characters to create an account', function (): void {
    $this->postJson(route('api.v1.checkout'), checkoutPayload(['create_account' => true, 'password' => 'short']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});

it('asks to log in when the e-mail already has an account', function (): void {
    User::factory()->create(['email' => 'jane@example.com']);

    $this->postJson(route('api.v1.checkout'), checkoutPayload(['create_account' => true, 'password' => 'secret-password']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['billing.email' => 'An account with this email already exists. Please log in.']);
});

it('lets a guest order with an e-mail that has an account, without creating one', function (): void {
    User::factory()->create(['email' => 'jane@example.com']);
    $cart = guestCartWith([Product::factory()->create()]);

    $this->withCookie(CartCookie::NAME, $cart->token)->postJson(route('api.v1.checkout'), checkoutPayload())->assertCreated();

    expect(User::query()->count())->toBe(1)
        ->and(Order::query()->sole()->user_id)->toBeNull();
    $this->assertGuest('web');
});

it('ignores "create an account" for a customer who is logged in', function (): void {
    $user = User::factory()->create();
    $user->cart()->create(['shipping_method' => 'local_delivery'])->items()->create(['product_id' => Product::factory()->create()->id, 'quantity' => 1]);

    $this->actingAs($user)
        ->postJson(route('api.v1.checkout'), checkoutPayload(['create_account' => true, 'password' => null]))
        ->assertCreated();

    expect(User::query()->count())->toBe(1);
});
