<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
final class OrderItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_name' => 'Aero Knit Running Shoe',
            'product_slug' => 'aero-knit-running-shoe',
            'sku' => 'KS-0001',
            'unit_price' => 5000,
            'quantity' => 2,
            'line_total' => 10000,
        ];
    }

    /** Snapshot of `$product` at `$quantity`, priced at its current price. */
    public function forProduct(Product $product, int $quantity = 1): static
    {
        return $this->state(fn (): array => [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'sku' => $product->sku,
            'unit_price' => $product->price,
            'quantity' => $quantity,
            'line_total' => $product->price * $quantity,
        ]);
    }
}
