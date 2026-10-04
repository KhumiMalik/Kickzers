<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Blog;

use App\Models\Post;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A short link to another post: previous/next navigation and popular posts.
 *
 * @property-read Post $resource
 */
final class PostLinkResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->resource->slug,
            'title' => $this->resource->title,
            'thumbnail' => MediaUrl::for($this->resource->thumbnail_path),
            'published_at' => $this->resource->published_at?->toIso8601ZuluString(),
        ];
    }
}
