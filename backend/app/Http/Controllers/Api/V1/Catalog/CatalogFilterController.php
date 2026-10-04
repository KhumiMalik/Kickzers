<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Catalog;

use App\DTOs\Catalog\CatalogFilters;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Catalog\CatalogFiltersResource;
use App\Repositories\Catalog\BrandRepository;
use App\Repositories\Catalog\CategoryRepository;
use App\Repositories\Catalog\ColorRepository;
use App\Repositories\Catalog\ProductRepository;

/** `GET /catalog/filters`: the shop sidebar facets with product counts. */
final class CatalogFilterController extends Controller
{
    public function __construct(
        private readonly CategoryRepository $categories,
        private readonly BrandRepository $brands,
        private readonly ColorRepository $colors,
        private readonly ProductRepository $products,
    ) {}

    public function __invoke(): CatalogFiltersResource
    {
        $priceRange = $this->products->publishedPriceRange();

        return new CatalogFiltersResource(new CatalogFilters(
            categories: $this->categories->treeWithPublishedProductCounts(),
            brands: $this->brands->withPublishedProducts(),
            colors: $this->colors->withPublishedProducts(),
            minPrice: $priceRange['min'],
            maxPrice: $priceRange['max'],
        ));
    }
}
