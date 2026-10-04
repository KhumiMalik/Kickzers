<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\Models\Banner;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A home page hero slide. `title_lines` are the two big heading lines.
 *
 * @property-read Banner $resource
 */
final class HeroSlideResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $banner = $this->resource;

        return [
            'id' => $banner->id,
            'title_lines' => array_values(array_filter([$banner->title_line_1, $banner->title_line_2], fn (?string $line): bool => $line !== null && $line !== '')),
            'body' => $banner->body,
            'image' => MediaUrl::for($banner->image_path),
            'product' => $banner->publishedProduct === null ? null : new ProductSummaryResource($banner->publishedProduct),
        ];
    }
}
