<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AddressType;
use App\Models\Order;
use App\Models\OrderAddress;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderAddress>
 */
final class OrderAddressFactory extends Factory
{
    /**
     * A billing address in the United States.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'type' => AddressType::Billing,
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'company' => null,
            'phone' => fake()->numerify('(###) ###-####'),
            'email' => fake()->safeEmail(),
            'country_code' => 'US',
            'country_name' => 'United States',
            'state' => 'California',
            'city' => fake()->city(),
            'address_line_1' => fake()->streetAddress(),
            'address_line_2' => null,
            'postcode' => fake()->postcode(),
        ];
    }

    /** Shipping addresses carry no contact details. */
    public function shipping(): static
    {
        return $this->state(fn (): array => ['type' => AddressType::Shipping, 'phone' => null, 'email' => null]);
    }
}
