<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A running promotion with its products (exclusive deal, deals of the week).
 * `ends_at` drives the countdown. Needs `publishedProducts` loaded
 * (PromotionRepository::running).
 *
 * @property-read Promotion $resource
 */
final class PromotionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->resource->title,
            'ends_at' => $this->resource->ends_at->toIso8601ZuluString(),
            'products' => ProductSummaryResource::collection($this->resource->publishedProducts),
        ];
    }
}
