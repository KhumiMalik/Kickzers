<?php

declare(strict_types=1);

use App\Models\Product;

it('is purchasable only when active and in stock', function (): void {
    expect(Product::factory()->make()->isPurchasable())->toBeTrue()
        ->and(Product::factory()->outOfStock()->make()->isPurchasable())->toBeFalse()
        ->and(Product::factory()->comingSoon()->withStock(5)->make()->isPurchasable())->toBeFalse()
        ->and(Product::factory()->draft()->make()->isPurchasable())->toBeFalse();
});

it('caps the purchasable quantity at the stock and at the per-order limit', function (int $stock, int $expected): void {
    expect(Product::factory()->withStock($stock)->make()->maxPurchasableQuantity())->toBe($expected);
})->with([
    'low stock' => [3, 3],
    'plenty of stock' => [500, Product::MAX_QUANTITY_PER_ORDER],
    'sold out' => [0, 0],
]);

it('offers no quantity for products that cannot be bought', function (): void {
    expect(Product::factory()->comingSoon()->withStock(10)->make()->maxPurchasableQuantity())->toBe(0);
});

it('uses the slug as its route key', function (): void {
    $product = Product::factory()->create(['slug' => 'aero-knit-running-shoe']);

    expect($product->getRouteKey())->toBe('aero-knit-running-shoe');
});
