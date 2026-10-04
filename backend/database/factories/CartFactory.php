<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ShippingMethod;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Cart>
 */
final class CartFactory extends Factory
{
    /**
     * An empty guest cart (identified by its token).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'token' => (string) Str::uuid(),
            'user_id' => null,
            'coupon_id' => null,
            'shipping_method' => ShippingMethod::LocalDelivery,
            'destination_country' => null,
            'destination_state' => null,
            'destination_postcode' => null,
            'notices' => [],
        ];
    }

    /** A logged-in user's cart (no guest token). */
    public function forUser(?User $user = null): static
    {
        return $this->state(fn (): array => ['token' => null, 'user_id' => $user === null ? User::factory() : $user->id]);
    }

    public function withCoupon(Coupon $coupon): static
    {
        return $this->state(fn (): array => ['coupon_id' => $coupon->id]);
    }
}
