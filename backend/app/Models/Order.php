<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AddressType;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShippingMethod;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A placed order. Amounts, names and addresses are snapshots taken at
 * checkout; they never change when the catalog does.
 *
 * @property-read int|string|null $items_sum_quantity only when loaded with withSum('items', 'quantity')
 */
#[Fillable([
    'number', 'user_id', 'idempotency_key', 'status', 'payment_status', 'payment_method', 'email', 'currency',
    'subtotal', 'discount', 'shipping_total', 'total', 'coupon_code', 'shipping_method', 'shipping_method_name',
    'notes', 'placed_at',
])]
#[RouteKey('number')]
final class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class)->orderBy('id');
    }

    /** @return HasMany<OrderAddress, $this> */
    public function addresses(): HasMany
    {
        return $this->hasMany(OrderAddress::class);
    }

    /** @return HasOne<OrderAddress, $this> */
    public function billingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', AddressType::Billing);
    }

    /** @return HasOne<OrderAddress, $this> */
    public function shippingAddress(): HasOne
    {
        return $this->hasOne(OrderAddress::class)->where('type', AddressType::Shipping);
    }

    /** @return HasOne<CouponRedemption, $this> */
    public function couponRedemption(): HasOne
    {
        return $this->hasOne(CouponRedemption::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'payment_method' => PaymentMethod::class,
            'shipping_method' => ShippingMethod::class,
            'subtotal' => 'integer',
            'discount' => 'integer',
            'shipping_total' => 'integer',
            'total' => 'integer',
            'placed_at' => 'datetime',
        ];
    }
}
