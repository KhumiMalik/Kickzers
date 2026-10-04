<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CouponType;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
final class CouponFactory extends Factory
{
    /**
     * An active 10% coupon without limits.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => Str::upper(fake()->unique()->bothify('????##')),
            'type' => CouponType::Percent,
            'value' => 10,
            'description' => '10% off',
            'min_subtotal' => null,
            'max_uses' => null,
            'times_used' => 0,
            'starts_at' => null,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    /** A fixed discount of `$amount` minor units. */
    public function fixed(int $amount): static
    {
        return $this->state(fn (): array => [
            'type' => CouponType::Fixed,
            'value' => $amount,
            'description' => '$'.number_format($amount / 100, 2).' off',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => ['expires_at' => now()->subDay()]);
    }

    public function notStarted(): static
    {
        return $this->state(fn (): array => ['starts_at' => now()->addDay()]);
    }

    /** Usage limit reached. */
    public function exhausted(): static
    {
        return $this->state(fn (): array => ['max_uses' => 5, 'times_used' => 5]);
    }

    /** Only valid for subtotals of at least `$amount` minor units. */
    public function withMinimumSubtotal(int $amount): static
    {
        return $this->state(fn (): array => ['min_subtotal' => $amount]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
