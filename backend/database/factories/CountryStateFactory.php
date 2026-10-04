<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Country;
use App\Models\CountryState;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CountryState>
 */
final class CountryStateFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'country_code' => Country::factory(),
            'name' => fake()->unique()->city(),
        ];
    }
}
