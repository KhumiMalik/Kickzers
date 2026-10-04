<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AddressType;
use Database\Factories\OrderAddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Billing or shipping address of an order (snapshot, including the country name). */
#[Fillable([
    'order_id', 'type', 'first_name', 'last_name', 'company', 'phone', 'email', 'country_code', 'country_name',
    'state', 'city', 'address_line_1', 'address_line_2', 'postcode',
])]
final class OrderAddress extends Model
{
    /** @use HasFactory<OrderAddressFactory> */
    use HasFactory;

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['type' => AddressType::class];
    }
}
