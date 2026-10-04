<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\Models\Banner;
use App\Models\Builders\ProductBuilder;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Banner>
 */
final class BannerRepository extends BaseRepository
{
    protected string $model = Banner::class;

    /**
     * Active hero slides in order, each with its product (null while that product is a draft).
     *
     * @return Collection<int, Banner>
     */
    public function activeSlides(): Collection
    {
        return $this->query()
            ->active()
            ->orderBy('position')
            ->orderBy('id')
            ->with(ProductBuilder::summaryRelations('publishedProduct'))
            ->get();
    }
}
