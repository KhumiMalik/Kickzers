<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BlogCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogCategory>
 */
final class BlogCategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word());

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'featured_title' => null,
            'featured_tagline' => null,
            'featured_image_path' => null,
            'featured_position' => null,
        ];
    }

    /** Shown as a card above the blog list, at `$position`. */
    public function featured(int $position = 1): static
    {
        return $this->state(fn (array $attributes): array => [
            'featured_title' => $attributes['name'],
            'featured_tagline' => fake()->sentence(4),
            'featured_image_path' => 'blog/cat-post-1.jpg',
            'featured_position' => $position,
        ]);
    }
}
