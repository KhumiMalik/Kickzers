<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CouponRedemption>
 */
final class CouponRedemptionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'coupon_id' => Coupon::factory(),
            'order_id' => Order::factory(),
            'user_id' => null,
            'email' => fake()->safeEmail(),
            'discount_amount' => 1000,
        ];
    }
}
