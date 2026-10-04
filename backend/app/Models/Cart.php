<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ShippingMethod;
use Database\Factories\CartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A server-owned shopping cart: a guest's (found by `token`) or a user's
 * (found by `user_id`). Totals are never stored; they are calculated.
 */
#[Fillable([
    'token', 'user_id', 'coupon_id', 'shipping_method', 'destination_country', 'destination_state',
    'destination_postcode', 'notices',
])]
final class Cart extends Model
{
    /** @use HasFactory<CartFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Coupon, $this> */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /** @return HasMany<CartItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class)->orderBy('id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'shipping_method' => ShippingMethod::class,
            'notices' => 'array',
        ];
    }
}
