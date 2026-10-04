<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProductStatus;
use App\Enums\PromotionType;
use Database\Factories\PromotionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/** A time-limited product group: the exclusive deal (with countdown) or the deals of the week. */
#[Fillable(['type', 'title', 'starts_at', 'ends_at'])]
final class Promotion extends Model
{
    /** @use HasFactory<PromotionFactory> */
    use HasFactory;

    /** @return BelongsToMany<Product, $this> */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)->withPivot('position')->orderByPivot('position');
    }

    /**
     * The products the storefront shows: drafts left out, in display order.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function publishedProducts(): BelongsToMany
    {
        return $this->products()->whereIn('products.status', ProductStatus::published());
    }

    /**
     * Promotions of this type running right now.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function running(Builder $query, PromotionType $type): void
    {
        $query->where('type', $type)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => PromotionType::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }
}
