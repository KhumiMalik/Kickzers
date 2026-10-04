<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('adds the guest\'s products to the account and returns the combined wishlist', function (): void {
    $alreadySaved = Product::factory()->create();
    $fromBrowser = Product::factory()->create();
    WishlistItem::factory()->for($this->user)->for($alreadySaved)->create(['created_at' => now()->subDay()]);

    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.merge'), ['product_ids' => [$fromBrowser->id, $alreadySaved->id]])
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $fromBrowser->id)
        ->assertJsonPath('data.1.id', $alreadySaved->id);

    expect(WishlistItem::query()->whereBelongsTo($this->user)->count())->toBe(2);
});

it('skips ids of drafts and products that no longer exist instead of failing', function (): void {
    $published = Product::factory()->create();
    $draft = Product::factory()->draft()->create();

    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.merge'), ['product_ids' => [$published->id, $draft->id, 999_999, $published->id]])
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('accepts an empty browser wishlist', function (): void {
    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.merge'), ['product_ids' => []])
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('validates the shape of the ids', function (array $payload, string $errorKey): void {
    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.merge'), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$errorKey]);
})->with([
    'missing' => [[], 'product_ids'],
    'not a list' => [['product_ids' => 'abc'], 'product_ids'],
    'more than 100' => [['product_ids' => range(1, 101)], 'product_ids'],
    'not integers' => [['product_ids' => ['abc']], 'product_ids.0'],
]);
