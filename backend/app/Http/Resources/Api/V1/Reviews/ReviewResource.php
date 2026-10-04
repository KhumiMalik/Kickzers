<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Reviews;

use App\Models\Review;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product review (contract §2.4). The author's email and phone are never returned.
 *
 * @property-read Review $resource
 */
final class ReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $review = $this->resource;

        return [
            'id' => $review->id,
            'author_name' => $review->author_name,
            'avatar' => MediaUrl::for($review->avatar_path),
            'rating' => $review->rating,
            'body' => $review->body,
            'created_at' => $review->created_at?->toIso8601ZuluString(),
        ];
    }
}
