<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use App\Models\ProductImage;

it('paginates published products, 12 per page by default', function (): void {
    Product::factory()->count(13)->create();
    Product::factory()->comingSoon()->create();
    Product::factory()->draft()->create();

    $this->getJson(route('api.v1.products.index'))
        ->assertOk()
        ->assertJsonCount(12, 'data')
        ->assertJsonPath('meta.total', 14)
        ->assertJsonPath('meta.per_page', 12)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonStructure(['data', 'links' => ['first', 'last', 'prev', 'next'], 'meta' => ['current_page', 'from', 'to', 'path']]);
});

it('uses the first gallery image as the card image', function (): void {
    $product = Product::factory()->create();
    ProductImage::factory()->for($product)->create(['path' => 'product/second.jpg', 'position' => 1]);
    ProductImage::factory()->for($product)->create(['path' => 'product/first.jpg', 'position' => 0]);

    expect($this->getJson(route('api.v1.products.index'))->json('data.0.image'))->toEndWith('/storage/product/first.jpg');
});

it('combines category (with sub-categories), brand, colour, price and search filters', function (): void {
    $shoes = Category::factory()->create(['slug' => 'shoes']);
    $running = Category::factory()->childOf($shoes)->create(['slug' => 'running']);
    $nike = Brand::factory()->create(['slug' => 'nike', 'name' => 'Nike']);
    $red = Color::factory()->create(['slug' => 'red']);

    $match = Product::factory()->for($running)->for($nike)->for($red)->priced(5000)->create(['name' => 'Air Runner']);
    Product::factory()->for($running)->for($nike)->for($red)->priced(9000)->create(['name' => 'Air Pricey']);
    Product::factory()->for($running)->for($nike)->priced(5000)->create(['name' => 'Air Blue']);
    Product::factory()->for($running)->for($red)->priced(5000)->create(['name' => 'Air Other Brand']);

    $this->getJson(route('api.v1.products.index', [
        'category' => 'shoes', 'brand' => 'nike', 'color' => 'red', 'min_price' => 1000, 'max_price' => 6000, 'q' => 'air',
    ]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $match->id);
});

it('sorts by price high to low', function (): void {
    Product::factory()->priced(2000)->create();
    Product::factory()->priced(9000)->create();
    Product::factory()->priced(5000)->create();

    expect($this->getJson(route('api.v1.products.index', ['sort' => 'price-desc']))->json('data.*.price'))
        ->toBe([9000, 5000, 2000]);
});

it('returns an empty list for unknown slugs instead of an error', function (): void {
    Product::factory()->create();

    $this->getJson(route('api.v1.products.index', ['category' => 'no-such-category']))
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.total', 0);
});

it('returns an empty page with correct meta beyond the last page', function (): void {
    Product::factory()->count(3)->create();

    $this->getJson(route('api.v1.products.index', ['page' => 5]))
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('meta.current_page', 5)
        ->assertJsonPath('meta.total', 3);
});

it('keeps the filters in the pagination links', function (): void {
    Product::factory()->count(7)->create();

    $next = $this->getJson(route('api.v1.products.index', ['per_page' => 6, 'sort' => 'name']))->json('links.next');

    expect($next)->toContain('per_page=6')->toContain('sort=name')->toContain('page=2');
});

it('rejects invalid sort, page size and price values', function (array $query, string $field): void {
    $this->getJson(route('api.v1.products.index', $query))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);
})->with([
    'unknown sort' => [['sort' => 'cheapest'], 'sort'],
    'page size not offered' => [['per_page' => 50], 'per_page'],
    'negative price' => [['min_price' => -1], 'min_price'],
    'price not an integer' => [['max_price' => '12.50'], 'max_price'],
    'max below min' => [['min_price' => 5000, 'max_price' => 1000], 'max_price'],
    'search too long' => [['q' => str_repeat('a', 101)], 'q'],
]);

it('accepts a max price without a min price', function (): void {
    Product::factory()->priced(1000)->create();

    $this->getJson(route('api.v1.products.index', ['max_price' => 2000]))->assertOk()->assertJsonCount(1, 'data');
});

it('runs the same number of queries however many products are listed', function (): void {
    Product::factory()->count(2)->create();
    $few = queryCount(fn () => $this->getJson(route('api.v1.products.index'))->assertOk());

    Product::factory()->count(10)->create();
    $many = queryCount(fn () => $this->getJson(route('api.v1.products.index'))->assertOk());

    expect($many)->toBe($few);
});
