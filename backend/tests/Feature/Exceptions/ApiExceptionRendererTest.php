<?php

declare(strict_types=1);

use App\Exceptions\ApiException;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 * The API's error format (docs/api-contract.md §1.8). Routes are registered
 * inside the tests because the real endpoints arrive in later phases.
 */

it('returns 404 with a JSON message for an unknown API route, even without an Accept header', function (): void {
    $this->get('/api/v1/does-not-exist')
        ->assertNotFound()
        ->assertExactJson(['message' => 'Not found.']);
});

it('returns 404 naming the model when route model binding finds nothing', function (): void {
    Route::middleware('api')->get('api/v1/test/users/{user}', fn (User $user): array => ['id' => $user->id]);

    $this->getJson('/api/v1/test/users/999')
        ->assertNotFound()
        ->assertExactJson(['message' => 'User not found.']);
});

it('returns 405 when the HTTP method is not allowed', function (): void {
    $this->deleteJson('/api/v1/health')
        ->assertMethodNotAllowed()
        ->assertExactJson(['message' => 'Method not allowed.']);
});

it('returns 401 for a protected route when not logged in', function (): void {
    Route::middleware(['api', 'auth:sanctum'])->get('api/v1/test/private', fn (): array => []);

    $this->getJson('/api/v1/test/private')
        ->assertUnauthorized()
        ->assertExactJson(['message' => 'Unauthenticated.']);
});

it('returns 422 in Laravel\'s validation format', function (): void {
    Route::middleware('api')->post('api/v1/test/validate', function (Request $request): array {
        return $request->validate(['email' => ['required', 'email']]);
    });

    $this->postJson('/api/v1/test/validate', [])
        ->assertUnprocessable()
        ->assertExactJson([
            'message' => 'The email field is required.',
            'errors' => ['email' => ['The email field is required.']],
        ]);
});

it('returns 429 with Retry-After once a rate limit is exceeded', function (): void {
    Route::middleware(['api', 'throttle:2,1'])->get('api/v1/test/limited', fn (): array => []);

    $this->getJson('/api/v1/test/limited')->assertOk();
    $this->getJson('/api/v1/test/limited')->assertOk();

    $this->getJson('/api/v1/test/limited')
        ->assertTooManyRequests()
        ->assertHeader('Retry-After', '60')
        ->assertExactJson(['message' => 'Too many attempts. Please try again in 60 seconds.']);
});

it('renders domain exceptions with their status and machine-readable code', function (): void {
    $conflict = new class('This checkout was already submitted.') extends ApiException
    {
        protected int $status = 409;

        protected ?string $errorCode = 'idempotency_conflict';
    };
    Route::middleware('api')->post('api/v1/test/conflict', fn () => throw $conflict);

    $this->postJson('/api/v1/test/conflict')
        ->assertConflict()
        ->assertExactJson(['message' => 'This checkout was already submitted.', 'code' => 'idempotency_conflict']);
});

it('hides unexpected errors behind a generic 500 message when debug is off', function (): void {
    config(['app.debug' => false]);
    Route::middleware('api')->get('api/v1/test/crash', fn () => throw new RuntimeException('SQLSTATE secret details'));

    $this->getJson('/api/v1/test/crash')
        ->assertInternalServerError()
        ->assertExactJson(['message' => 'Server error.']);
});

it('leaves non-API errors to Laravel\'s default rendering', function (): void {
    $this->get('/no-such-page')->assertNotFound()->assertDontSee('"message"', escape: false);
});
