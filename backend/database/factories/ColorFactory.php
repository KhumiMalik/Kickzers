<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Color;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Color>
 */
final class ColorFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // colorName() has ~140 values; safeColorName() only 17, too few for tests that create many products.
        $name = Str::title(fake()->unique()->colorName());

        return ['name' => $name, 'slug' => Str::slug($name), 'hex' => fake()->hexColor()];
    }
}
