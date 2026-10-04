<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProductStatus;
use App\Models\Builders\ProductBuilder;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\UseEloquentBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * A sellable product. Prices are integer minor units (cents).
 *
 * @method static ProductBuilder query()
 */
#[Fillable([
    'category_id', 'brand_id', 'color_id', 'name', 'slug', 'sku', 'short_description', 'description',
    'price', 'compare_at_price', 'stock_quantity', 'status', 'position', 'published_at',
])]
#[RouteKey('slug')]
#[UseEloquentBuilder(ProductBuilder::class)]
final class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /** Most of one product a customer may have in the cart. */
    public const int MAX_QUANTITY_PER_ORDER = 99;

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return BelongsTo<Color, $this> */
    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position')->orderBy('id');
    }

    /** @return HasMany<ProductSpecification, $this> */
    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class)->orderBy('position')->orderBy('id');
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** @return MorphMany<Comment, $this> */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /** @return BelongsToMany<Promotion, $this> */
    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class)->withPivot('position');
    }

    /** Can be added to a cart right now. */
    public function isPurchasable(): bool
    {
        return $this->status === ProductStatus::Active && $this->stock_quantity > 0;
    }

    /** Upper bound for the quantity stepper: stock, capped per order. */
    public function maxPurchasableQuantity(): int
    {
        return $this->isPurchasable() ? min($this->stock_quantity, self::MAX_QUANTITY_PER_ORDER) : 0;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'price' => 'integer',
            'compare_at_price' => 'integer',
            'stock_quantity' => 'integer',
            'position' => 'integer',
            'published_at' => 'datetime',
        ];
    }
}
