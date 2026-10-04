<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Enums\ShippingMethod;
use App\Models\Country;
use App\Models\CountryState;
use App\Models\Coupon;
use App\Models\ShippingRate;
use Illuminate\Database\Seeder;

/**
 * Data the shop needs to work at all: countries and states for the address
 * forms, default shipping prices and the two launch coupons.
 *
 * Written with updateOrCreate so it is safe to run again (also in production).
 */
final class ReferenceDataSeeder extends Seeder
{
    /** @var array<string, array{name: string, states: list<string>}> */
    private const array COUNTRIES = [
        'US' => ['name' => 'United States', 'states' => ['California', 'Florida', 'New York', 'Texas']],
        'GB' => ['name' => 'United Kingdom', 'states' => ['England', 'Northern Ireland', 'Scotland', 'Wales']],
        'PK' => ['name' => 'Pakistan', 'states' => ['Balochistan', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh']],
        'IN' => ['name' => 'India', 'states' => ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu']],
        'BD' => ['name' => 'Bangladesh', 'states' => ['Chittagong', 'Dhaka', 'Khulna', 'Sylhet']],
    ];

    public function run(): void
    {
        $this->seedCountries();
        $this->seedShippingRates();
        $this->seedCoupons();
    }

    private function seedCountries(): void
    {
        $position = 0;

        foreach (self::COUNTRIES as $code => $country) {
            Country::query()->updateOrCreate(['code' => $code], ['name' => $country['name'], 'position' => $position++]);

            foreach ($country['states'] as $state) {
                CountryState::query()->updateOrCreate(['country_code' => $code, 'name' => $state]);
            }
        }
    }

    /** Default prices (country_code NULL) for every method, in cents. */
    private function seedShippingRates(): void
    {
        $prices = [
            ShippingMethod::FlatRate5->value => 500,
            ShippingMethod::Free->value => 0,
            ShippingMethod::FlatRate10->value => 1000,
            ShippingMethod::LocalDelivery->value => 200,
        ];

        foreach ($prices as $method => $price) {
            ShippingRate::query()->updateOrCreate(['method' => $method, 'country_code' => null], ['price' => $price]);
        }
    }

    private function seedCoupons(): void
    {
        Coupon::query()->updateOrCreate(['code' => 'KARMA10'], [
            'type' => CouponType::Percent,
            'value' => 10,
            'description' => '10% off',
        ]);

        Coupon::query()->updateOrCreate(['code' => 'SAVE20'], [
            'type' => CouponType::Fixed,
            'value' => 2000,
            'description' => '$20 off',
        ]);
    }
}
