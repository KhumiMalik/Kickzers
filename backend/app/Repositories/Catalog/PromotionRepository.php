<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\Enums\PromotionType;
use App\Models\Builders\ProductBuilder;
use App\Models\Promotion;
use App\Repositories\BaseRepository;

/**
 * @extends BaseRepository<Promotion>
 */
final class PromotionRepository extends BaseRepository
{
    protected string $model = Promotion::class;

    /**
     * The running promotion of this type (the one ending soonest if several
     * overlap) with its published products loaded in display order, keeping
     * at most `$productLimit` of them.
     */
    public function running(PromotionType $type, ?int $productLimit = null): ?Promotion
    {
        $promotion = $this->query()
            ->running($type)
            ->orderBy('ends_at')
            ->orderBy('id')
            ->with(ProductBuilder::summaryRelations('publishedProducts'))
            ->first();

        if ($promotion !== null && $productLimit !== null) {
            $promotion->setRelation('publishedProducts', $promotion->publishedProducts->take($productLimit));
        }

        return $promotion;
    }
}
