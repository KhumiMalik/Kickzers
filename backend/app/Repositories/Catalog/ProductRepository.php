<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\DTOs\Catalog\ProductFilters;
use App\Enums\ProductSort;
use App\Models\Builders\ProductBuilder;
use App\Models\Product;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Product>
 */
final class ProductRepository extends BaseRepository
{
    protected string $model = Product::class;

    /** Narrows the return type so the shop scopes of ProductBuilder are available. */
    public function query(): ProductBuilder
    {
        return Product::query();
    }

    /**
     * The shop listing: published products matching the filters.
     *
     * @return LengthAwarePaginator<int, Product>
     */
    public function search(ProductFilters $filters, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->published()
            ->inCategory($filters->category)
            ->forBrand($filters->brand)
            ->forColor($filters->color)
            ->priceBetween($filters->minPrice, $filters->maxPrice)
            ->search($filters->search)
            ->sortedBy($filters->sort)
            ->withSummaryRelations()
            ->paginate($perPage);
    }

    /** A published product by slug (drafts are not found). */
    public function findPublishedBySlug(string $slug): Product
    {
        return $this->query()->published()->where('slug', $slug)->firstOrFail();
    }

    /** A published product by id, ready for a ProductSummary. */
    public function findPublishedSummary(int $id): Product
    {
        return $this->query()->published()->withSummaryRelations()->findOrFail($id);
    }

    /** Loads everything the product page shows (ProductDetail). */
    public function loadDetail(Product $product): Product
    {
        return $product
            ->load(['primaryImage', 'images', 'specifications', 'category.parent', 'brand', 'color'])
            ->loadCount('approvedComments');
    }

    /**
     * Newest products that can be bought (home page "Latest Products").
     *
     * @return Collection<int, Product>
     */
    public function latest(int $limit): Collection
    {
        return $this->query()->available()->sortedBy(ProductSort::Newest)->withSummaryRelations()->limit($limit)->get();
    }

    /**
     * Coming-soon products in catalog order (home page "Coming Products").
     *
     * @return Collection<int, Product>
     */
    public function comingSoon(int $limit): Collection
    {
        return $this->query()->comingSoon()->sortedBy(ProductSort::Default)->withSummaryRelations()->limit($limit)->get();
    }

    /**
     * Products that can be bought, from the same family first (product page carousel).
     *
     * @return Collection<int, Product>
     */
    public function related(Product $product, int $limit): Collection
    {
        return $this->query()->available()->relatedTo($product)->withSummaryRelations()->limit($limit)->get();
    }

    /**
     * Cheapest and most expensive published price, for the price slider.
     *
     * @return array{min: int|null, max: int|null}
     */
    public function publishedPriceRange(): array
    {
        $range = $this->query()->published()->toBase()->selectRaw('min(price) as min_price, max(price) as max_price')->first();

        return [
            'min' => isset($range->min_price) ? (int) $range->min_price : null,
            'max' => isset($range->max_price) ? (int) $range->max_price : null,
        ];
    }
}
