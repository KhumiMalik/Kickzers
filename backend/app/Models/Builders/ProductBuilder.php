<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Enums\ProductSort;
use App\Enums\ProductStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;

/**
 * Query builder for products: every filter the shop page can send
 * (docs/api-contract.md §5.2). Each method returns $this so they chain:
 * Product::query()->published()->inCategory('running')->sortedBy(ProductSort::PriceAsc).
 *
 * @extends Builder<Product>
 */
final class ProductBuilder extends Builder
{
    /** Visible in the shop: active and coming-soon products (not drafts). */
    public function published(): self
    {
        return $this->whereIn('status', ProductStatus::published());
    }

    /** Can currently be bought (coming-soon products are published but not available). */
    public function available(): self
    {
        return $this->where('status', ProductStatus::Active);
    }

    public function comingSoon(): self
    {
        return $this->where('status', ProductStatus::ComingSoon);
    }

    /** Products of the category with this slug **or any of its sub-categories**. */
    public function inCategory(?string $slug): self
    {
        if ($slug === null || $slug === '') {
            return $this;
        }

        $categoryIds = Category::query()
            ->select('id')
            ->where('slug', $slug)
            ->orWhereIn('parent_id', Category::query()->select('id')->where('slug', $slug));

        return $this->whereIn('category_id', $categoryIds);
    }

    public function forBrand(?string $slug): self
    {
        if ($slug === null || $slug === '') {
            return $this;
        }

        return $this->whereIn('brand_id', Brand::query()->select('id')->where('slug', $slug));
    }

    public function forColor(?string $slug): self
    {
        if ($slug === null || $slug === '') {
            return $this;
        }

        return $this->whereIn('color_id', Color::query()->select('id')->where('slug', $slug));
    }

    /** Inclusive price range in minor units; either bound may be null. */
    public function priceBetween(?int $min, ?int $max): self
    {
        return $this
            ->when($min !== null, fn (self $query) => $query->where('price', '>=', $min))
            ->when($max !== null, fn (self $query) => $query->where('price', '<=', $max));
    }

    /** Case-insensitive search in the product name and the brand name. */
    public function search(?string $term): self
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $this;
        }

        return $this->where(fn (self $query) => $query
            ->whereLike('name', "%{$term}%")
            ->orWhereIn('brand_id', Brand::query()->select('id')->whereLike('name', "%{$term}%")));
    }

    /** Sort order, always ending with the primary key so pagination is stable. */
    public function sortedBy(ProductSort $sort): self
    {
        match ($sort) {
            ProductSort::Default => $this->orderBy('position'),
            ProductSort::Newest => $this->orderByDesc('published_at'),
            ProductSort::PriceAsc => $this->orderBy('price')->orderBy('position'),
            ProductSort::PriceDesc => $this->orderByDesc('price')->orderBy('position'),
            ProductSort::Name => $this->orderBy('name'),
        };

        return $this->orderBy('id');
    }
}
