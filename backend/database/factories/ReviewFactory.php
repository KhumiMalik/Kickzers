<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
final class ReviewFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id' => null,
            'author_name' => fake()->name(),
            'author_email' => fake()->safeEmail(),
            'author_phone' => null,
            'avatar_path' => null,
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->paragraph(),
            'is_approved' => true,
        ];
    }

    public function rating(int $stars): static
    {
        return $this->state(fn (): array => ['rating' => $stars]);
    }

    /** Waiting for moderation (not shown or counted). */
    public function unapproved(): static
    {
        return $this->state(fn (): array => ['is_approved' => false]);
    }
}
