<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;

it('lists products from the same family first, then the rest in catalog order', function (): void {
    $shoes = Category::factory()->create();
    $running = Category::factory()->childOf($shoes)->create();
    $sneakers = Category::factory()->childOf($shoes)->create();
    $clothing = Category::factory()->create();

    $product = Product::factory()->for($running)->create(['position' => 1]);
    $otherFamily = Product::factory()->for($clothing)->create(['position' => 2]);
    $sibling = Product::factory()->for($sneakers)->create(['position' => 3]);
    $sameCategory = Product::factory()->for($running)->create(['position' => 4]);

    expect($this->getJson(route('api.v1.products.related', $product))->assertOk()->json('data.*.id'))
        ->toBe([$sibling->id, $sameCategory->id, $otherFamily->id]);
});

it('leaves out the product itself, coming-soon products and drafts', function (): void {
    $product = Product::factory()->create();
    $available = Product::factory()->create();
    Product::factory()->comingSoon()->create();
    Product::factory()->draft()->create();

    $this->getJson(route('api.v1.products.related', $product))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $available->id);
});

it('returns at most nine products', function (): void {
    $product = Product::factory()->create();
    Product::factory()->count(11)->create();

    $this->getJson(route('api.v1.products.related', $product))->assertJsonCount(9, 'data');
});

it('is not found for a draft product', function (): void {
    $draft = Product::factory()->draft()->create();

    $this->getJson(route('api.v1.products.related', $draft->slug))->assertNotFound();
});
