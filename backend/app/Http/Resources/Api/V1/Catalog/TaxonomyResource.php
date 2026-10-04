<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `{ slug, name }` of a category, brand or colour (contract §2.1).
 *
 * @property-read Category|Brand|Color $resource
 */
final class TaxonomyResource extends JsonResource
{
    /** @return array{slug: string, name: string} */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
        ];
    }
}
