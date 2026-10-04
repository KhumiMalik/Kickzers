<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BlogTag;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogTag>
 */
final class BlogTagFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->word());

        return ['name' => $name, 'slug' => Str::slug($name)];
    }
}
