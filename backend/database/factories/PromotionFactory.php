<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\PromotionType;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
final class PromotionFactory extends Factory
{
    /**
     * A "deals of the week" promotion running from yesterday until next week.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => PromotionType::DealsOfTheWeek,
            'title' => 'Deals of the Week',
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
        ];
    }

    public function exclusiveDeal(): static
    {
        return $this->state(fn (): array => [
            'type' => PromotionType::ExclusiveDeal,
            'title' => 'Exclusive Hot Deal Ends Soon!',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => ['starts_at' => now()->subWeeks(2), 'ends_at' => now()->subDay()]);
    }

    public function upcoming(): static
    {
        return $this->state(fn (): array => ['starts_at' => now()->addDay(), 'ends_at' => now()->addWeek()]);
    }
}
