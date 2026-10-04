<?php

declare(strict_types=1);

use App\Models\Product;
use Illuminate\Support\Facades\Queue;

/*
 * Reviews, comments, contact messages and newsletter sign-ups share the
 * "submissions" limiter: 5 a minute and 50 a day per IP (contract §1.9).
 */

beforeEach(function (): void {
    Queue::fake();
});

it('allows five submissions a minute per IP, across all forms', function (): void {
    $product = Product::factory()->create();

    foreach (range(1, 3) as $attempt) {
        $this->postJson(route('api.v1.newsletter'), ['email' => "reader{$attempt}@example.com"])->assertAccepted();
    }
    $this->postJson(route('api.v1.products.reviews.store', $product), ['name' => 'A', 'email' => 'a@example.com', 'rating' => 5, 'body' => 'x'])->assertCreated();
    $this->postJson(route('api.v1.contact'), ['name' => 'A', 'email' => 'a@example.com', 'subject' => 'Hi', 'message' => 'x'])->assertCreated();

    $this->postJson(route('api.v1.newsletter'), ['email' => 'one-too-many@example.com'])
        ->assertTooManyRequests()
        ->assertHeader('Retry-After');
});

it('allows at most fifty submissions a day per IP', function (): void {
    foreach (range(1, 50) as $attempt) {
        // Move past the per-minute window every five requests.
        if ($attempt % 5 === 1 && $attempt > 1) {
            $this->travel(61)->seconds();
        }

        $this->postJson(route('api.v1.newsletter'), ['email' => "reader{$attempt}@example.com"])->assertAccepted();
    }

    $this->travel(61)->seconds();

    $this->postJson(route('api.v1.newsletter'), ['email' => 'reader51@example.com'])->assertTooManyRequests();
});

it('counts each IP separately', function (): void {
    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('api.v1.newsletter'), ['email' => "reader{$attempt}@example.com"])->assertAccepted();
    }

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
        ->postJson(route('api.v1.newsletter'), ['email' => 'neighbour@example.com'])
        ->assertAccepted();
});
