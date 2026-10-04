<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;

beforeEach(function (): void {
    $this->user = User::factory()->create();
});

it('requires a login', function (string $method, string $routeName, array $parameters): void {
    $this->json($method, route($routeName, $parameters))->assertUnauthorized();
})->with([
    'list' => ['GET', 'api.v1.wishlist.index', []],
    'add' => ['POST', 'api.v1.wishlist.store', []],
    'remove' => ['DELETE', 'api.v1.wishlist.destroy', ['productId' => 1]],
    'merge' => ['POST', 'api.v1.wishlist.merge', []],
]);

it('saves a product with 201, and answers 200 when it is already saved', function (): void {
    $product = Product::factory()->create();

    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.store'), ['product_id' => $product->id])
        ->assertCreated()
        ->assertJsonPath('data.id', $product->id)
        ->assertJsonPath('data.slug', $product->slug);

    $this->actingAs($this->user)
        ->postJson(route('api.v1.wishlist.store'), ['product_id' => $product->id])
        ->assertOk();

    expect(WishlistItem::query()->count())->toBe(1);
});

it('saves coming-soon products but not drafts or unknown products', function (): void {
    $comingSoon = Product::factory()->comingSoon()->create();
    $draft = Product::factory()->draft()->create();

    $this->actingAs($this->user)->postJson(route('api.v1.wishlist.store'), ['product_id' => $comingSoon->id])->assertCreated();

    foreach ([$draft->id, 999, 'abc', null] as $productId) {
        $this->actingAs($this->user)
            ->postJson(route('api.v1.wishlist.store'), ['product_id' => $productId])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['product_id']);
    }
});

it('lists saved products newest first, hiding products that became drafts', function (): void {
    $first = Product::factory()->create();
    $second = Product::factory()->create();
    $hidden = Product::factory()->create();
    WishlistItem::factory()->for($this->user)->for($first)->create(['created_at' => now()->subDays(2)]);
    WishlistItem::factory()->for($this->user)->for($second)->create(['created_at' => now()->subDay()]);
    WishlistItem::factory()->for($this->user)->for($hidden)->create();
    WishlistItem::factory()->for($first)->create();
    $hidden->update(['status' => 'draft']);

    $this->actingAs($this->user)
        ->getJson(route('api.v1.wishlist.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $second->id)
        ->assertJsonPath('data.1.id', $first->id);
});

it('removes a product with 204, also when it was not saved, and only for this customer', function (): void {
    $product = Product::factory()->create();
    WishlistItem::factory()->for($this->user)->for($product)->create();
    $othersItem = WishlistItem::factory()->for($product)->create();

    $this->actingAs($this->user)->deleteJson(route('api.v1.wishlist.destroy', $product->id))->assertNoContent();
    $this->actingAs($this->user)->deleteJson(route('api.v1.wishlist.destroy', $product->id))->assertNoContent();

    expect(WishlistItem::query()->pluck('id')->all())->toBe([$othersItem->id]);
});

it('runs the same number of queries however many products are saved', function (): void {
    WishlistItem::factory()->for($this->user)->create();
    $few = queryCount(fn () => $this->actingAs($this->user)->getJson(route('api.v1.wishlist.index'))->assertOk());

    WishlistItem::factory()->count(8)->for($this->user)->create();
    $many = queryCount(fn () => $this->actingAs($this->user)->getJson(route('api.v1.wishlist.index'))->assertOk());

    expect($many)->toBe($few);
});
