<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Review;

it('lists approved reviews newest first without contact details', function (): void {
    $product = Product::factory()->create();
    $older = Review::factory()->for($product)->create(['created_at' => now()->subDays(2), 'author_phone' => '555-0100']);
    $newer = Review::factory()->for($product)->create(['created_at' => now()->subDay()]);
    Review::factory()->for($product)->unapproved()->create();
    Review::factory()->create();

    $response = $this->getJson(route('api.v1.products.reviews.index', $product))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $newer->id)
        ->assertJsonPath('data.1.id', $older->id)
        ->assertJsonStructure(['data' => [['id', 'author_name', 'avatar', 'rating', 'body', 'created_at']]]);

    expect($response->json('data.0'))->not->toHaveKeys(['author_email', 'author_phone', 'email']);
});

it('pages reviews 10 at a time unless asked otherwise', function (): void {
    $product = Product::factory()->create();
    Review::factory()->count(12)->for($product)->create();

    $this->getJson(route('api.v1.products.reviews.index', $product))
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.total', 12);

    $this->getJson(route('api.v1.products.reviews.index', [$product, 'per_page' => 5]))
        ->assertJsonCount(5, 'data');
});

it('rejects a page size above 50', function (): void {
    $product = Product::factory()->create();

    $this->getJson(route('api.v1.products.reviews.index', [$product, 'per_page' => 51]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['per_page']);
});

it('is not found for a draft product', function (): void {
    $draft = Product::factory()->draft()->create();

    $this->getJson(route('api.v1.products.reviews.index', $draft->slug))->assertNotFound();
});
