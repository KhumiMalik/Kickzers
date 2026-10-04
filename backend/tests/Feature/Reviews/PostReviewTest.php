<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Review;
use App\Models\User;

beforeEach(function (): void {
    $this->product = Product::factory()->create();
});

it('publishes a review straight away and returns it without contact details', function (): void {
    $this->postJson(route('api.v1.products.reviews.store', $this->product), [
        'name' => 'Blake Ruiz', 'email' => 'Blake@Example.com', 'phone' => '555-0100', 'rating' => 5, 'body' => '  Great shoes.  ',
    ])
        ->assertCreated()
        ->assertJsonPath('data.author_name', 'Blake Ruiz')
        ->assertJsonPath('data.rating', 5)
        ->assertJsonPath('data.body', 'Great shoes.')
        ->assertJsonPath('data.avatar', null)
        ->assertJsonMissingPath('data.email')
        ->assertJsonMissingPath('data.phone');

    expect(Review::query()->sole())
        ->author_email->toBe('blake@example.com')
        ->author_phone->toBe('555-0100')
        ->is_approved->toBeTrue();

    $this->getJson(route('api.v1.products.show', $this->product))->assertJsonPath('data.rating.count', 1);
});

it('fills name and e-mail from the account of a logged-in customer', function (): void {
    $user = User::factory()->create(['name' => 'Jane Doe', 'email' => 'jane@example.com']);

    $this->actingAs($user)
        ->postJson(route('api.v1.products.reviews.store', $this->product), ['rating' => 4, 'body' => 'Comfortable.'])
        ->assertCreated()
        ->assertJsonPath('data.author_name', 'Jane Doe');

    expect(Review::query()->sole())
        ->user_id->toBe($user->id)
        ->author_email->toBe('jane@example.com');
});

it('validates the review', function (array $payload, string $field, ?string $message = null): void {
    $response = $this->postJson(route('api.v1.products.reviews.store', $this->product), [
        'name' => 'Blake', 'email' => 'blake@example.com', 'rating' => 5, 'body' => 'Nice.', ...$payload,
    ])->assertUnprocessable();

    $response->assertJsonValidationErrors($message === null ? [$field] : [$field => $message]);
})->with([
    'no rating' => [['rating' => null], 'rating', 'Please choose a rating from 1 to 5.'],
    'rating too high' => [['rating' => 6], 'rating', 'Please choose a rating from 1 to 5.'],
    'no name' => [['name' => ''], 'name'],
    'bad e-mail' => [['email' => 'nope'], 'email'],
    'body too long' => [['body' => str_repeat('a', 2001)], 'body'],
]);

it('is not found for a draft product', function (): void {
    $draft = Product::factory()->draft()->create();

    $this->postJson(route('api.v1.products.reviews.store', $draft->slug), ['name' => 'A', 'email' => 'a@example.com', 'rating' => 5, 'body' => 'x'])
        ->assertNotFound();
});
