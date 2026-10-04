<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use Database\Seeders\CatalogSeeder;

it('returns the seeded facets with counts over published products', function (): void {
    $this->seed(CatalogSeeder::class);

    $response = $this->getJson(route('api.v1.catalog.filters'))->assertOk();

    $response
        ->assertJsonCount(5, 'data.categories')
        ->assertJsonPath('data.categories.0.slug', 'men-shoes')
        ->assertJsonPath('data.categories.0.products_count', 7)
        ->assertJsonPath('data.categories.0.children.0', ['slug' => 'running', 'name' => 'Running', 'products_count' => 3])
        ->assertJsonPath('data.categories.4', ['slug' => 'accessories', 'name' => 'Accessories', 'products_count' => 0, 'children' => []])
        ->assertJsonPath('data.brands.0', ['slug' => 'adidas', 'name' => 'Adidas', 'products_count' => 5])
        ->assertJsonPath('data.price_range', ['min' => 4500, 'max' => 15000])
        ->assertJsonPath('data.currency', 'USD');
});

it('counts a parent category with its children and leaves drafts out', function (): void {
    $parent = Category::factory()->create();
    $child = Category::factory()->childOf($parent)->create();
    Product::factory()->for($parent)->create();
    Product::factory()->count(2)->for($child)->create();
    Product::factory()->for($child)->draft()->create();

    $this->getJson(route('api.v1.catalog.filters'))
        ->assertJsonPath('data.categories.0.products_count', 3)
        ->assertJsonPath('data.categories.0.children.0.products_count', 2);
});

it('omits brands and colours without published products', function (): void {
    $used = Brand::factory()->create();
    Brand::factory()->create();
    $draftOnly = Color::factory()->create();
    Product::factory()->for($used)->draft()->for($draftOnly)->create();
    Product::factory()->for($used)->create();

    $response = $this->getJson(route('api.v1.catalog.filters'));

    expect($response->json('data.brands.*.slug'))->toBe([$used->slug])
        ->and($response->json('data.colors.*.slug'))->not->toContain($draftOnly->slug);
});

it('returns a null price range when nothing is published', function (): void {
    $this->getJson(route('api.v1.catalog.filters'))
        ->assertOk()
        ->assertJsonPath('data.price_range', ['min' => null, 'max' => null]);
});

it('runs the same number of queries however many categories and products exist', function (): void {
    Product::factory()->count(2)->create();
    $few = queryCount(fn () => $this->getJson(route('api.v1.catalog.filters'))->assertOk());

    Product::factory()->count(10)->for(Category::factory()->childOf(Category::factory()->create()))->create();
    $many = queryCount(fn () => $this->getJson(route('api.v1.catalog.filters'))->assertOk());

    expect($many)->toBe($few);
});
