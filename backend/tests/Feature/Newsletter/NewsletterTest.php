<?php

declare(strict_types=1);

use App\Models\NewsletterSubscriber;

it('subscribes an e-mail with 202', function (): void {
    $this->postJson(route('api.v1.newsletter'), ['email' => ' Jane@Example.com '])
        ->assertAccepted()
        ->assertExactJson(['message' => 'Thank you for subscribing!']);

    expect(NewsletterSubscriber::query()->sole()->email)->toBe('jane@example.com');
});

it('answers the same for an address that is already subscribed and keeps one row', function (): void {
    NewsletterSubscriber::factory()->create(['email' => 'jane@example.com']);

    $this->postJson(route('api.v1.newsletter'), ['email' => 'JANE@example.com'])
        ->assertAccepted()
        ->assertExactJson(['message' => 'Thank you for subscribing!']);

    expect(NewsletterSubscriber::query()->count())->toBe(1);
});

it('re-subscribes an address that had unsubscribed', function (): void {
    $subscriber = NewsletterSubscriber::factory()->unsubscribed()->create(['email' => 'jane@example.com']);

    $this->postJson(route('api.v1.newsletter'), ['email' => 'jane@example.com'])->assertAccepted();

    expect($subscriber->refresh()->unsubscribed_at)->toBeNull();
});

it('requires a valid e-mail', function (): void {
    $this->postJson(route('api.v1.newsletter'), ['email' => 'nope'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});
