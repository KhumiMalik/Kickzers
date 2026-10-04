<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Banner;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
final class BannerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'title_line_1' => 'New',
            'title_line_2' => 'Collection!',
            'body' => fake()->sentence(20),
            'image_path' => 'banners/banner-img.png',
            'position' => 0,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
