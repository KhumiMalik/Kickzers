<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
final class OrderFactory extends Factory
{
    /**
     * A guest's cash-on-delivery order: $100.00 + $10.00 flat-rate shipping.
     * (Items and addresses are separate factories; amounts here are a consistent snapshot.)
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'number' => 'KZ-'.now()->year.'-'.fake()->unique()->numerify('######'),
            'user_id' => null,
            'idempotency_key' => (string) Str::uuid(),
            'status' => OrderStatus::Processing,
            'payment_status' => PaymentStatus::Unpaid,
            'payment_method' => PaymentMethod::CashOnDelivery,
            'email' => fake()->safeEmail(),
            'currency' => 'USD',
            'subtotal' => 10000,
            'discount' => 0,
            'shipping_total' => 1000,
            'total' => 11000,
            'coupon_code' => null,
            'shipping_method' => ShippingMethod::FlatRate10,
            'shipping_method_name' => ShippingMethod::FlatRate10->label(),
            'notes' => null,
            'placed_at' => now(),
        ];
    }

    public function forUser(?User $user = null): static
    {
        if ($user === null) {
            return $this->state(fn (): array => ['user_id' => User::factory(), 'email' => fake()->safeEmail()]);
        }

        return $this->state(fn (): array => ['user_id' => $user->id, 'email' => $user->email]);
    }

    public function status(OrderStatus $status): static
    {
        return $this->state(fn (): array => ['status' => $status]);
    }
}
