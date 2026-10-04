<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\Models\Brand;
use App\Models\Builders\ProductBuilder;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Brand>
 */
final class BrandRepository extends BaseRepository
{
    protected string $model = Brand::class;

    /**
     * Brands that have published products, with their count, in the order they were added.
     * (Filtered in PHP rather than with HAVING on the alias, which PostgreSQL does not allow.)
     *
     * @return Collection<int, Brand>
     */
    public function withPublishedProducts(): Collection
    {
        return $this->query()
            ->withCount(['products' => fn (ProductBuilder $query) => $query->published()])
            ->orderBy('id')
            ->get()
            ->filter(fn (Brand $brand): bool => $brand->products_count > 0)
            ->values();
    }
}
