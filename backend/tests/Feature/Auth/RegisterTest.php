<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;

/** @return array<string, string> */
function registration(array $overrides = []): array
{
    return [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        ...$overrides,
    ];
}

it('creates the account, logs it in and answers 201', function (): void {
    Event::fake([Registered::class]);

    $response = $this->postJson(route('api.v1.auth.register'), registration(), spaHeaders())
        ->assertCreated()
        ->assertJsonPath('data.name', 'Jane Doe')
        ->assertJsonPath('data.email', 'jane@example.com')
        ->assertJsonMissingPath('data.password');

    $user = User::query()->where('email', 'jane@example.com')->sole();

    expect($response->json('data.id'))->toBe($user->id)
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();
    $this->assertAuthenticatedAs($user, 'web');
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
});

it('stores the email in lower case and trims the name', function (): void {
    $this->postJson(route('api.v1.auth.register'), registration(['name' => '  Jane  ', 'email' => ' Jane@Example.COM']), spaHeaders())
        ->assertCreated();

    expect(User::query()->sole())
        ->email->toBe('jane@example.com')
        ->name->toBe('Jane');
});

it('rejects an email that already has an account, whatever its letter case', function (): void {
    User::factory()->create(['email' => 'jane@example.com']);

    $this->postJson(route('api.v1.auth.register'), registration(['email' => 'JANE@example.com']), spaHeaders())
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

it('requires a confirmed password of at least 8 characters', function (array $overrides): void {
    $this->postJson(route('api.v1.auth.register'), registration($overrides), spaHeaders())
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);

    $this->assertGuest('web');
})->with([
    'too short' => [['password' => 'short', 'password_confirmation' => 'short']],
    'not confirmed' => [['password_confirmation' => 'something-else']],
]);

it('requires a name and a valid email', function (): void {
    $this->postJson(route('api.v1.auth.register'), registration(['name' => '', 'email' => 'nope']), spaHeaders())
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email']);
});

it('refuses a user who is already logged in with 403', function (): void {
    $this->actingAs(User::factory()->create())
        ->postJson(route('api.v1.auth.register'), registration(), spaHeaders())
        ->assertForbidden();

    expect(User::query()->count())->toBe(1);
});

it('is rate limited to five attempts per minute for one email and IP', function (): void {
    User::factory()->create(['email' => 'jane@example.com']);

    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('api.v1.auth.register'), registration(), spaHeaders())->assertUnprocessable();
    }

    $this->postJson(route('api.v1.auth.register'), registration(), spaHeaders())->assertTooManyRequests();
});
