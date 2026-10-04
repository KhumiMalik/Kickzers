<?php

declare(strict_types=1);

use App\Models\User;

it('returns the logged-in user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('api.v1.auth.user'))
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonMissingPath('data.password')
        ->assertJsonMissingPath('data.remember_token');
});

it('answers 401 to a guest asking who is logged in', function (): void {
    $this->getJson(route('api.v1.auth.user'))
        ->assertUnauthorized()
        ->assertExactJson(['message' => 'Unauthenticated.']);
});

it('logs out with 204 and forgets the user', function (): void {
    $user = User::factory()->create();
    $this->actingAs($user)->withSession(['cart_hint' => 'kept until logout']);

    $this->postJson(route('api.v1.auth.logout'), [], spaHeaders())->assertNoContent();

    $this->assertGuest('web');
    expect(session()->has('cart_hint'))->toBeFalse();
});

it('answers 401 to a guest logging out', function (): void {
    $this->postJson(route('api.v1.auth.logout'), [], spaHeaders())->assertUnauthorized();
});

it('sends the httpOnly session cookie that keeps the SPA logged in', function (): void {
    User::factory()->create(['email' => 'jane@example.com', 'password' => 'secret-password']);

    $cookie = $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password'], spaHeaders())
        ->assertOk()
        ->getCookie(config()->string('session.cookie'), decrypt: false);

    expect($cookie)->not->toBeNull()
        ->and($cookie?->isHttpOnly())->toBeTrue();
});
