<?php

declare(strict_types=1);

namespace App\DTOs\Catalog;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use Illuminate\Database\Eloquent\Collection;

/** The shop sidebar facets of `GET /catalog/filters`. */
final readonly class CatalogFilters
{
    /**
     * @param  Collection<int, Category>  $categories  top-level categories with `children` loaded
     * @param  Collection<int, Brand>  $brands
     * @param  Collection<int, Color>  $colors
     */
    public function __construct(
        public Collection $categories,
        public Collection $brands,
        public Collection $colors,
        public ?int $minPrice,
        public ?int $maxPrice,
    ) {}
}
