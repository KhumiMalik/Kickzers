<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\DTOs\Catalog\HomePage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `GET /home` (contract §5.1). The two deal blocks are null when no
 * promotion of that type is running.
 *
 * @property-read HomePage $resource
 */
final class HomeResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $home = $this->resource;

        return [
            'hero_slides' => HeroSlideResource::collection($home->heroSlides),
            'latest' => ProductSummaryResource::collection($home->latest),
            'coming_soon' => ProductSummaryResource::collection($home->comingSoon),
            'exclusive_deal' => $home->exclusiveDeal === null ? null : new PromotionResource($home->exclusiveDeal),
            'deals_of_the_week' => $home->dealsOfTheWeek === null ? null : new PromotionResource($home->dealsOfTheWeek),
        ];
    }
}
