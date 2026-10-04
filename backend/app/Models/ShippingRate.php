<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShippingMethod;
use Database\Factories\ShippingRateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Price of a shipping method. A row without a country is the default price;
 * a row with a country overrides it for that destination.
 */
#[Fillable(['method', 'country_code', 'price'])]
final class ShippingRate extends Model
{
    /** @use HasFactory<ShippingRateFactory> */
    use HasFactory;

    /** @return BelongsTo<Country, $this> */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_code', 'code');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['method' => ShippingMethod::class, 'price' => 'integer'];
    }
}
