<?php

declare(strict_types=1);

use App\Models\Banner;
use App\Models\Product;
use App\Models\Promotion;
use Database\Seeders\CatalogSeeder;

it('returns every home page block from the seeded catalog', function (): void {
    $this->seed(CatalogSeeder::class);

    $response = $this->getJson(route('api.v1.home'))->assertOk();

    $response
        ->assertJsonCount(2, 'data.hero_slides')
        ->assertJsonPath('data.hero_slides.0.title_lines', ['Nike New', 'Collection!'])
        ->assertJsonPath('data.hero_slides.0.product.slug', 'zoom-flight-basketball-shoe')
        ->assertJsonCount(8, 'data.latest')
        ->assertJsonPath('data.latest.0.slug', 'zoom-flight-basketball-shoe')
        ->assertJsonCount(4, 'data.coming_soon')
        ->assertJsonPath('data.coming_soon.0.is_coming_soon', true)
        ->assertJsonPath('data.exclusive_deal.title', 'Exclusive Hot Deal Ends Soon!')
        ->assertJsonPath('data.exclusive_deal.products.1.slug', 'comic-hi-top-canvas')
        ->assertJsonCount(8, 'data.deals_of_the_week.products');

    expect($response->json('data.hero_slides.0.image'))->toEndWith('/storage/banner/banner-img.png')
        ->and($response->json('data.exclusive_deal.ends_at'))->toMatch('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/');
});

it('shows a product card in the documented shape', function (): void {
    $this->seed(CatalogSeeder::class);

    $this->getJson(route('api.v1.home'))
        ->assertJsonStructure(['data' => ['latest' => [[
            'id', 'slug', 'name', 'image', 'price', 'compare_at_price', 'currency', 'is_in_stock', 'is_coming_soon',
            'category' => ['slug', 'name'], 'brand' => ['slug', 'name'],
        ]]]])
        ->assertJsonPath('data.latest.0.currency', 'USD')
        ->assertJsonPath('data.latest.0.price', 14999)
        ->assertJsonPath('data.latest.0.compare_at_price', 18999);
});

it('lists only products that can be bought as latest, and never drafts', function (): void {
    $active = Product::factory()->create(['published_at' => now()->subDay()]);
    Product::factory()->comingSoon()->create(['published_at' => now()]);
    Product::factory()->draft()->create(['published_at' => now()]);

    $this->getJson(route('api.v1.home'))
        ->assertJsonCount(1, 'data.latest')
        ->assertJsonPath('data.latest.0.id', $active->id)
        ->assertJsonCount(1, 'data.coming_soon');
});

it('returns null deal blocks when no promotion is running', function (): void {
    Promotion::factory()->expired()->create();
    Promotion::factory()->exclusiveDeal()->upcoming()->create();

    $this->getJson(route('api.v1.home'))
        ->assertOk()
        ->assertJsonPath('data.exclusive_deal', null)
        ->assertJsonPath('data.deals_of_the_week', null);
});

it('hides a slide product while it is a draft but keeps the slide', function (): void {
    Banner::factory()->for(Product::factory()->draft())->create();

    $this->getJson(route('api.v1.home'))
        ->assertJsonCount(1, 'data.hero_slides')
        ->assertJsonPath('data.hero_slides.0.product', null);
});

it('limits deals of the week to nine products', function (): void {
    $promotion = Promotion::factory()->create();
    $promotion->products()->attach(Product::factory()->count(12)->create()->pluck('id'));

    $this->getJson(route('api.v1.home'))->assertJsonCount(9, 'data.deals_of_the_week.products');
});

it('runs the same number of queries however many products there are', function (): void {
    // At least one product per block: Laravel skips eager-load queries for an empty block.
    Product::factory()->count(2)->create();
    Product::factory()->comingSoon()->create();
    $few = queryCount(fn () => $this->getJson(route('api.v1.home'))->assertOk());

    Product::factory()->count(10)->create();
    Product::factory()->count(5)->comingSoon()->create();
    $many = queryCount(fn () => $this->getJson(route('api.v1.home'))->assertOk());

    expect($many)->toBe($few);
});
