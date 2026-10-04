<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BlogAuthor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogAuthor>
 */
final class BlogAuthorFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => 'Blog writer',
            'avatar_path' => null,
            'bio' => fake()->paragraph(),
            'is_featured' => false,
        ];
    }

    /** The author shown in the blog sidebar. */
    public function featured(): static
    {
        return $this->state(fn (): array => ['is_featured' => true]);
    }
}
