<?php

declare(strict_types=1);

use App\Enums\ProductSort;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;

it('publishes active and coming-soon products but not drafts', function (): void {
    $active = Product::factory()->create();
    $comingSoon = Product::factory()->comingSoon()->create();
    Product::factory()->draft()->create();

    expect(Product::query()->published()->pluck('id')->sort()->values()->all())
        ->toBe([$active->id, $comingSoon->id]);
});

it('treats only active products as available', function (): void {
    $active = Product::factory()->create();
    Product::factory()->comingSoon()->create();
    Product::factory()->draft()->create();

    expect(Product::query()->available()->pluck('id')->all())->toBe([$active->id]);
});

it('filters by a parent category including its sub-categories', function (): void {
    $shoes = Category::factory()->create(['slug' => 'shoes']);
    $running = Category::factory()->childOf($shoes)->create(['slug' => 'running']);
    $clothing = Category::factory()->create(['slug' => 'clothing']);

    $inParent = Product::factory()->for($shoes)->create();
    $inChild = Product::factory()->for($running)->create();
    Product::factory()->for($clothing)->create();

    expect(Product::query()->inCategory('shoes')->pluck('id')->sort()->values()->all())
        ->toBe([$inParent->id, $inChild->id])
        ->and(Product::query()->inCategory('running')->pluck('id')->all())->toBe([$inChild->id]);
});

it('filters by brand and colour slug', function (): void {
    $nike = Brand::factory()->create(['slug' => 'nike']);
    $red = Color::factory()->create(['slug' => 'red']);

    $redNike = Product::factory()->for($nike)->for($red)->create();
    $otherNike = Product::factory()->for($nike)->create();
    Product::factory()->create();

    expect(Product::query()->forBrand('nike')->pluck('id')->sort()->values()->all())
        ->toBe([$redNike->id, $otherNike->id])
        ->and(Product::query()->forBrand('nike')->forColor('red')->pluck('id')->all())->toBe([$redNike->id]);
});

it('ignores empty filter values', function (): void {
    Product::factory()->count(2)->create();

    $query = Product::query()
        ->inCategory(null)
        ->forBrand('')
        ->forColor(null)
        ->priceBetween(null, null)
        ->search('  ');

    expect($query->count())->toBe(2);
});

it('filters by an inclusive price range in cents', function (): void {
    $cheap = Product::factory()->priced(1000)->create();
    $middle = Product::factory()->priced(5000)->create();
    $expensive = Product::factory()->priced(9000)->create();

    expect(Product::query()->priceBetween(1000, 5000)->pluck('id')->sort()->values()->all())->toBe([$cheap->id, $middle->id])
        ->and(Product::query()->priceBetween(5001, null)->pluck('id')->all())->toBe([$expensive->id])
        ->and(Product::query()->priceBetween(null, 999)->count())->toBe(0);
});

it('searches the product name and the brand name case-insensitively', function (): void {
    $byName = Product::factory()->create(['name' => 'Aero Knit Running Shoe']);
    $byBrand = Product::factory()->for(Brand::factory()->create(['name' => 'Asics']))->create(['name' => 'Gel Blaze']);
    Product::factory()->create(['name' => 'Classic Crew Sweatshirt']);

    expect(Product::query()->search('KNIT')->pluck('id')->all())->toBe([$byName->id])
        ->and(Product::query()->search('asics')->pluck('id')->all())->toBe([$byBrand->id]);
});

it('sorts by every supported order with a stable tie-breaker', function (ProductSort $sort, array $expectedNames): void {
    Product::factory()->create(['name' => 'Bravo', 'price' => 3000, 'position' => 2, 'published_at' => now()->subDays(3)]);
    Product::factory()->create(['name' => 'Alpha', 'price' => 5000, 'position' => 3, 'published_at' => now()->subDay()]);
    Product::factory()->create(['name' => 'Charlie', 'price' => 1000, 'position' => 1, 'published_at' => now()->subDays(2)]);

    expect(Product::query()->sortedBy($sort)->pluck('name')->all())->toBe($expectedNames);
})->with([
    'default (position)' => [ProductSort::Default, ['Charlie', 'Bravo', 'Alpha']],
    'newest' => [ProductSort::Newest, ['Alpha', 'Charlie', 'Bravo']],
    'price ascending' => [ProductSort::PriceAsc, ['Charlie', 'Bravo', 'Alpha']],
    'price descending' => [ProductSort::PriceDesc, ['Alpha', 'Bravo', 'Charlie']],
    'name' => [ProductSort::Name, ['Alpha', 'Bravo', 'Charlie']],
]);

it('breaks sort ties by id so pagination never repeats or skips a product', function (): void {
    $products = Product::factory()->count(3)->priced(2500)->create(['position' => 0]);

    expect(Product::query()->sortedBy(ProductSort::PriceAsc)->pluck('id')->all())
        ->toBe($products->pluck('id')->all());
});
