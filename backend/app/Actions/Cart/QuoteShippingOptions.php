<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\DTOs\Cart\ShippingOption;
use App\Enums\ShippingMethod;
use App\Models\ShippingRate;
use App\Repositories\Cart\ShippingRateRepository;

/**
 * Which shipping methods a destination can use, and at what price.
 *
 * - Domestic-only methods (Local Delivery) need the store's country, or no
 *   country chosen yet.
 * - A rate for the destination country overrides the default rate.
 * - A method without any rate row is switched off.
 *
 * The order follows the ShippingMethod enum, which matches the template.
 */
final readonly class QuoteShippingOptions
{
    public function __construct(private ShippingRateRepository $rates) {}

    /** @return list<ShippingOption> */
    public function handle(?string $countryCode): array
    {
        $rates = $this->rates->ratesFor($countryCode);
        $storeCountry = config()->string('shop.store_country');
        $options = [];

        foreach (ShippingMethod::cases() as $method) {
            if ($method->isDomesticOnly() && $countryCode !== null && $countryCode !== $storeCountry) {
                continue;
            }

            $methodRates = $rates->filter(fn (ShippingRate $rate): bool => $rate->method === $method);
            $rate = $methodRates->firstWhere('country_code', $countryCode) ?? $methodRates->firstWhere('country_code', null);

            if ($rate instanceof ShippingRate) {
                $options[] = new ShippingOption($method, $rate->price);
            }
        }

        return $options;
    }
}
