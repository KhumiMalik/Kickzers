<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ColorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'hex'])]
final class Color extends Model
{
    /** @use HasFactory<ColorFactory> */
    use HasFactory;

    /** @return HasMany<Product, $this> */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
