<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CouponType;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A discount code. The rules that decide whether it applies (dates, usage
 * limit, minimum subtotal) live in the cart Actions (Phase 8).
 */
#[Fillable([
    'code', 'type', 'value', 'description', 'min_subtotal', 'max_uses', 'times_used', 'starts_at', 'expires_at', 'is_active',
])]
final class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    /** @return HasMany<CouponRedemption, $this> */
    public function redemptions(): HasMany
    {
        return $this->hasMany(CouponRedemption::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'integer',
            'min_subtotal' => 'integer',
            'max_uses' => 'integer',
            'times_used' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
