<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartCookie;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Testing\TestResponse;

beforeEach(function (): void {
    $this->seed(ReferenceDataSeeder::class);
    $this->withHeaders(spaHeaders())->withCredentials();

    $this->user = User::factory()->create(['email' => 'jane@example.com', 'password' => 'secret-password']);
    $this->guestCart = Cart::factory()->create();
});

function logInWithGuestCart(): TestResponse
{
    return test()->withCookie(CartCookie::NAME, test()->guestCart->token)
        ->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password']);
}

it('turns the guest cart into the account cart when the account has none, and clears the cookie', function (): void {
    CartItem::factory()->for($this->guestCart)->quantity(2)->create();

    logInWithGuestCart()->assertOk()->assertCookieExpired(CartCookie::NAME);

    $cart = $this->guestCart->refresh();
    expect($cart->user_id)->toBe($this->user->id)
        ->and($cart->token)->toBeNull();
});

it('adds guest quantities to the account cart, capped at the stock, and deletes the guest cart', function (): void {
    $userCart = Cart::factory()->forUser($this->user)->create();
    $shared = Product::factory()->withStock(5)->create();
    $guestOnly = Product::factory()->create();
    CartItem::factory()->for($userCart)->for($shared)->quantity(3)->create();
    CartItem::factory()->for($this->guestCart)->for($shared)->quantity(4)->create();
    CartItem::factory()->for($this->guestCart)->for($guestOnly)->quantity(2)->create();

    logInWithGuestCart()->assertOk();

    expect($userCart->items()->pluck('quantity', 'product_id')->all())->toEqual([$shared->id => 5, $guestOnly->id => 2])
        ->and(Cart::query()->count())->toBe(1);
});

it('drops guest products that can no longer be bought', function (): void {
    $userCart = Cart::factory()->forUser($this->user)->create();
    CartItem::factory()->for($this->guestCart)->for(Product::factory()->outOfStock())->create();

    logInWithGuestCart()->assertOk();

    expect($userCart->items()->count())->toBe(0);
});

it('takes the guest coupon only when the account cart has none', function (?string $accountCoupon, string $expected): void {
    Cart::factory()->forUser($this->user)->create([
        'coupon_id' => $accountCoupon === null ? null : Coupon::factory()->create(['code' => $accountCoupon])->id,
    ]);
    $this->guestCart->update(['coupon_id' => Coupon::factory()->create(['code' => 'GUEST'])->id]);

    logInWithGuestCart()->assertOk();

    expect($this->user->cart()->firstOrFail()->coupon()->value('code'))->toBe($expected);
})->with([
    'account has none' => [null, 'GUEST'],
    'account has one' => ['MINE', 'MINE'],
]);

it('merges the guest cart into a newly registered account', function (): void {
    CartItem::factory()->for($this->guestCart)->quantity(2)->create();

    $this->withCookie(CartCookie::NAME, $this->guestCart->token)
        ->postJson(route('api.v1.auth.register'), [
            'name' => 'Sam', 'email' => 'sam@example.com', 'password' => 'secret-password', 'password_confirmation' => 'secret-password',
        ])
        ->assertCreated()
        ->assertCookieExpired(CartCookie::NAME);

    expect(User::query()->where('email', 'sam@example.com')->sole()->cart()->firstOrFail()->items()->sum('quantity'))->toEqual(2);
});
