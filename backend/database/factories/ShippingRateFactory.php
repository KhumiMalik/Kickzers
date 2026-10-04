<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ShippingMethod;
use App\Models\Country;
use App\Models\ShippingRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ShippingRate>
 */
final class ShippingRateFactory extends Factory
{
    /**
     * The default (all countries) Flat Rate $10.00.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'method' => ShippingMethod::FlatRate10,
            'country_code' => null,
            'price' => 1000,
        ];
    }

    /** A price override for one destination country. */
    public function forCountry(Country $country): static
    {
        return $this->state(fn (): array => ['country_code' => $country->code]);
    }
}
