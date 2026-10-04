<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
final class ProductFactory extends Factory
{
    /**
     * An active, in-stock product priced between $10 and $200 (minor units).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(rtrim(fake()->unique()->sentence(3, false), '.'));

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'color_id' => Color::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'sku' => fake()->unique()->bothify('KZ-####-??'),
            'short_description' => fake()->sentence(16),
            'description' => fake()->paragraph()."\n\n".fake()->paragraph(),
            'price' => fake()->numberBetween(10, 200) * 100,
            'compare_at_price' => null,
            'stock_quantity' => 25,
            'status' => ProductStatus::Active,
            'position' => 0,
            'published_at' => now()->subDay(),
        ];
    }

    /** Announced but not purchasable yet. */
    public function comingSoon(): static
    {
        return $this->state(fn (): array => ['status' => ProductStatus::ComingSoon, 'stock_quantity' => 0]);
    }

    /** Hidden from the shop. */
    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => ProductStatus::Draft]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (): array => ['stock_quantity' => 0]);
    }

    public function withStock(int $quantity): static
    {
        return $this->state(fn (): array => ['stock_quantity' => $quantity]);
    }

    /** Priced at `$price` minor units, optionally with a struck-through `$compareAtPrice`. */
    public function priced(int $price, ?int $compareAtPrice = null): static
    {
        return $this->state(fn (): array => ['price' => $price, 'compare_at_price' => $compareAtPrice]);
    }
}
