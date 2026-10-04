<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CouponRedemptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Records one use of a coupon by one order (enforces usage limits). */
#[Fillable(['coupon_id', 'order_id', 'user_id', 'email', 'discount_amount'])]
final class CouponRedemption extends Model
{
    /** @use HasFactory<CouponRedemptionFactory> */
    use HasFactory;

    /** @return BelongsTo<Coupon, $this> */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['discount_amount' => 'integer'];
    }
}
