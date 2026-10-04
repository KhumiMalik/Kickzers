<?php

declare(strict_types=1);

namespace App\Repositories\Reference;

use App\Models\Country;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Country>
 */
final class CountryRepository extends BaseRepository
{
    protected string $model = Country::class;

    /**
     * Countries in display order with their states (alphabetical).
     *
     * @return Collection<int, Country>
     */
    public function allWithStates(): Collection
    {
        return $this->query()
            ->with('states')
            ->orderBy('position')
            ->orderBy('code')
            ->get();
    }
}
