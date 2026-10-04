<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\Models\Builders\ProductBuilder;
use App\Models\Color;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Color>
 */
final class ColorRepository extends BaseRepository
{
    protected string $model = Color::class;

    /**
     * Colours that have published products, with their count, in the order they were added.
     *
     * @return Collection<int, Color>
     */
    public function withPublishedProducts(): Collection
    {
        return $this->query()
            ->withCount(['products' => fn (ProductBuilder $query) => $query->published()])
            ->orderBy('id')
            ->get()
            ->filter(fn (Color $color): bool => $color->products_count > 0)
            ->values();
    }
}
