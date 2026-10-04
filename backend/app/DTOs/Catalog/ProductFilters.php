<?php

declare(strict_types=1);

namespace App\DTOs\Catalog;

use App\Enums\ProductSort;

/** The validated shop filters of `GET /products`. Prices are minor units. */
final readonly class ProductFilters
{
    public function __construct(
        public ?string $category = null,
        public ?string $brand = null,
        public ?string $color = null,
        public ?int $minPrice = null,
        public ?int $maxPrice = null,
        public ?string $search = null,
        public ProductSort $sort = ProductSort::Default,
    ) {}
}
