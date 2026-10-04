<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\DTOs\Catalog\CatalogFilters;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `GET /catalog/filters` (contract §5.3). A parent category counts its own
 * products plus those of its children, matching the `category` filter.
 *
 * @property-read CatalogFilters $resource
 */
final class CatalogFiltersResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $filters = $this->resource;

        return [
            'categories' => $filters->categories->map(fn (Category $parent): array => [
                'slug' => $parent->slug,
                'name' => $parent->name,
                'products_count' => $parent->products_count + $parent->children->sum('products_count'),
                'children' => $parent->children->map(fn (Category $child): array => [
                    'slug' => $child->slug,
                    'name' => $child->name,
                    'products_count' => $child->products_count,
                ])->all(),
            ])->all(),
            'brands' => $filters->brands->map(fn (Brand $brand): array => $this->facet($brand))->all(),
            'colors' => $filters->colors->map(fn (Color $color): array => $this->facet($color))->all(),
            'price_range' => ['min' => $filters->minPrice, 'max' => $filters->maxPrice],
            'currency' => config('shop.currency'),
        ];
    }

    /** @return array{slug: string, name: string, products_count: int} */
    private function facet(Brand|Color $item): array
    {
        return ['slug' => $item->slug, 'name' => $item->name, 'products_count' => $item->products_count];
    }
}
