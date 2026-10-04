<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Cart;

use App\Models\Country;
use App\Models\CountryState;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A country with its state names (cart shipping calculator and checkout selects).
 *
 * @property-read Country $resource
 */
final class CountryResource extends JsonResource
{
    /** @return array{code: string, name: string, states: list<string>} */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->resource->code,
            'name' => $this->resource->name,
            'states' => array_values($this->resource->states->map(fn (CountryState $state): string => $state->name)->all()),
        ];
    }
}
