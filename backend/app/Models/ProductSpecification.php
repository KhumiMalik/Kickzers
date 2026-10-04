<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProductSpecificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One row of the product page "Specification" tab. */
#[Fillable(['product_id', 'label', 'value', 'position'])]
final class ProductSpecification extends Model
{
    /** @use HasFactory<ProductSpecificationFactory> */
    use HasFactory;

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
