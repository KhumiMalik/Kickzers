<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Comment;
use App\Models\Product;
use App\Models\Review;
use Database\Seeders\CatalogSeeder;

it('returns the product page of a seeded product', function (): void {
    $this->seed(CatalogSeeder::class);

    $response = $this->getJson(route('api.v1.products.show', 'aero-knit-running-shoe'))->assertOk();

    $response
        ->assertJsonPath('data.sku', 'KZ-0001')
        ->assertJsonPath('data.category', [
            'slug' => 'running', 'name' => 'Running', 'parent' => ['slug' => 'men-shoes', 'name' => "Men's Shoes"],
        ])
        ->assertJsonPath('data.color', ['slug' => 'grey', 'name' => 'Grey'])
        ->assertJsonPath('data.max_quantity', 25)
        ->assertJsonPath('data.rating.count', 3)
        ->assertJsonPath('data.rating.breakdown', ['5' => 1, '4' => 1, '3' => 1, '2' => 0, '1' => 0])
        ->assertJsonPath('data.comments_count', 3)
        ->assertJsonPath('data.specifications.0', ['label' => 'Upper', 'value' => 'Engineered mesh'])
        ->assertJsonCount(2, 'data.description')
        ->assertJsonCount(3, 'data.gallery');

    expect($response->json('data.rating.average'))->toEqual(4.0)
        ->and($response->json('data.gallery.0'))->toEndWith('/storage/product/p1.jpg');
});

it('sends the rating breakdown as an object keyed by stars', function (): void {
    $product = Product::factory()->create();

    $json = $this->getJson(route('api.v1.products.show', $product))->getContent();

    expect($json)->toContain('"breakdown":{"5":0,"4":0,"3":0,"2":0,"1":0}')
        ->and($json)->toContain('"average":0');
});

it('rates and counts only approved reviews and comments', function (): void {
    $product = Product::factory()->create();
    Review::factory()->for($product)->rating(5)->create();
    Review::factory()->for($product)->rating(2)->create();
    Review::factory()->for($product)->rating(1)->unapproved()->create();
    $thread = Comment::factory()->create(['commentable_id' => $product->id]);
    Comment::factory()->replyTo($thread)->create();
    Comment::factory()->unapproved()->create(['commentable_id' => $product->id]);

    $response = $this->getJson(route('api.v1.products.show', $product))
        ->assertJsonPath('data.rating.count', 2)
        ->assertJsonPath('data.rating.breakdown.1', 0)
        ->assertJsonPath('data.comments_count', 2);

    expect($response->json('data.rating.average'))->toEqual(3.5);
});

it('caps the quantity stepper and offers none for coming-soon products', function (): void {
    $plenty = Product::factory()->withStock(500)->create();
    $comingSoon = Product::factory()->comingSoon()->create();

    $this->getJson(route('api.v1.products.show', $plenty))->assertJsonPath('data.max_quantity', Product::MAX_QUANTITY_PER_ORDER);
    $this->getJson(route('api.v1.products.show', $comingSoon))
        ->assertOk()
        ->assertJsonPath('data.max_quantity', 0)
        ->assertJsonPath('data.is_in_stock', false)
        ->assertJsonPath('data.is_coming_soon', true);
});

it('returns null as the parent of a top-level category', function (): void {
    $product = Product::factory()->for(Category::factory())->create();

    $this->getJson(route('api.v1.products.show', $product))->assertJsonPath('data.category.parent', null);
});

it('does not reveal drafts or unknown slugs', function (string $slug): void {
    Product::factory()->draft()->create(['slug' => 'secret-draft']);

    $this->getJson(route('api.v1.products.show', $slug))
        ->assertNotFound()
        ->assertExactJson(['message' => 'Product not found.']);
})->with(['secret-draft', 'no-such-product']);
