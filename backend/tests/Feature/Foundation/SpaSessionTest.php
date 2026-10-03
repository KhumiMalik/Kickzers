<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
 * Sanctum SPA setup (docs/api-contract.md §1.3): the React app on
 * http://localhost:5173 uses cookies, so CORS must allow credentials for that
 * origin only, and state-changing requests from it must carry a CSRF token.
 */

const SPA_ORIGIN = 'http://localhost:5173';

it('allows credentialed CORS requests from the SPA origin', function (): void {
    $this->call('OPTIONS', '/api/v1/health', server: [
        'HTTP_ORIGIN' => SPA_ORIGIN,
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
    ])
        ->assertNoContent()
        ->assertHeader('Access-Control-Allow-Origin', SPA_ORIGIN)
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});

it('never allows other origins', function (): void {
    // With a single allowed origin the middleware always answers with that origin;
    // a browser on another origin sees the mismatch and blocks the response.
    $response = $this->call('OPTIONS', '/api/v1/health', server: [
        'HTTP_ORIGIN' => 'https://evil.example',
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
    ]);

    expect($response->headers->get('Access-Control-Allow-Origin'))->toBe(SPA_ORIGIN);
});

it('starts a session for requests from the SPA (stateful API)', function (): void {
    $this->getJson('/api/v1/health', ['Origin' => SPA_ORIGIN, 'Referer' => SPA_ORIGIN.'/'])
        ->assertOk()
        ->assertCookie(config('session.cookie'));
});

it('issues the XSRF-TOKEN cookie the SPA sends back as a header', function (): void {
    $this->get('/sanctum/csrf-cookie', ['Origin' => SPA_ORIGIN])
        ->assertNoContent()
        ->assertCookie('XSRF-TOKEN');
});

it('rejects state-changing requests from the SPA without a CSRF token with 419', function (): void {
    Route::middleware('api')->post('api/v1/test/write', fn (): array => ['ok' => true]);
    // Laravel skips CSRF checks in the "testing" environment; switch it off for this request.
    $this->app->detectEnvironment(fn (): string => 'local');

    $this->postJson('/api/v1/test/write', [], ['Origin' => SPA_ORIGIN, 'Referer' => SPA_ORIGIN.'/'])
        ->assertStatus(419)
        ->assertExactJson(['message' => 'CSRF token mismatch.']);
});
