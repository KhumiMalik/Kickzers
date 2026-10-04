<?php

declare(strict_types=1);

namespace App\Repositories\Cart;

use App\Models\ShippingRate;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<ShippingRate>
 */
final class ShippingRateRepository extends BaseRepository
{
    protected string $model = ShippingRate::class;

    /**
     * The default rates (no country) plus the overrides for `$countryCode`,
     * in one query. QuoteShippingOptions picks the override when both exist.
     *
     * @return Collection<int, ShippingRate>
     */
    public function ratesFor(?string $countryCode): Collection
    {
        return $this->query()
            ->where(fn ($query) => $query
                ->whereNull('country_code')
                ->when($countryCode !== null, fn ($forCountry) => $forCountry->orWhere('country_code', $countryCode)))
            ->get();
    }
}
