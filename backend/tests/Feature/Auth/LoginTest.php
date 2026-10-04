<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Auth;

beforeEach(function (): void {
    $this->user = User::factory()->create(['email' => 'jane@example.com', 'password' => 'secret-password']);
});

it('logs in with the right credentials and returns the user', function (): void {
    $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password'], spaHeaders())
        ->assertOk()
        ->assertExactJson(['data' => [
            'id' => $this->user->id,
            'name' => $this->user->name,
            'email' => 'jane@example.com',
            'created_at' => $this->user->created_at->toIso8601ZuluString(),
        ]]);

    $this->assertAuthenticatedAs($this->user, 'web');
});

it('accepts the email in any letter case', function (): void {
    $this->postJson(route('api.v1.auth.login'), ['email' => '  Jane@Example.COM ', 'password' => 'secret-password'], spaHeaders())
        ->assertOk();

    $this->assertAuthenticatedAs($this->user, 'web');
});

it('gives a new session id on login (no session fixation)', function (): void {
    $this->withSession(['visited' => true]);
    $before = session()->getId();

    $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password'], spaHeaders())
        ->assertOk();

    expect(session()->getId())->not->toBe($before);
});

it('sets the remember-me cookie only when asked', function (): void {
    $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password', 'remember' => true], spaHeaders())
        ->assertOk()
        ->assertCookie(Auth::guard('web')->getRecallerName());
});

it('gives the same answer for a wrong password and an unknown email', function (string $email, string $password): void {
    $this->postJson(route('api.v1.auth.login'), ['email' => $email, 'password' => $password], spaHeaders())
        ->assertUnprocessable()
        ->assertJsonPath('errors.email', ['These credentials do not match our records.'])
        ->assertJsonMissingPath('errors.password');

    $this->assertGuest('web');
})->with([
    'wrong password' => ['jane@example.com', 'wrong-password'],
    'unknown email' => ['nobody@example.com', 'secret-password'],
]);

it('validates the input', function (): void {
    $this->postJson(route('api.v1.auth.login'), ['email' => 'not-an-email'], spaHeaders())
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});

it('refuses a user who is already logged in with 403', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password'], spaHeaders())
        ->assertForbidden()
        ->assertExactJson(['message' => 'This action is unauthorized.']);
});

it('allows five attempts per minute for one email and IP, then answers 429', function (): void {
    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'wrong'], spaHeaders())
            ->assertUnprocessable();
    }

    $this->postJson(route('api.v1.auth.login'), ['email' => 'jane@example.com', 'password' => 'secret-password'], spaHeaders())
        ->assertTooManyRequests()
        ->assertHeader('Retry-After')
        ->assertJsonPath('message', fn (string $message): bool => str_starts_with($message, 'Too many attempts.'));

    // Another account from the same network is not locked out.
    User::factory()->create(['email' => 'sam@example.com', 'password' => 'other-password']);
    $this->postJson(route('api.v1.auth.login'), ['email' => 'sam@example.com', 'password' => 'other-password'], spaHeaders())
        ->assertOk();
});
