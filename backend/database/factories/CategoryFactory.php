<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
final class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(rtrim(fake()->unique()->sentence(2, false), '.'));

        return [
            'parent_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'position' => 0,
        ];
    }

    /** A sub-category of `$parent`. */
    public function childOf(Category $parent): static
    {
        return $this->state(fn (): array => ['parent_id' => $parent->id]);
    }
}
