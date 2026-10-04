<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A home page hero slide ("Nike New / Collection!") promoting one product. */
#[Fillable(['product_id', 'title_line_1', 'title_line_2', 'body', 'image_path', 'position', 'is_active'])]
final class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @param  Builder<self>  $query */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['position' => 'integer', 'is_active' => 'boolean'];
    }
}
