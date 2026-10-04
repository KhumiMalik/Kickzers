<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Blog;

use App\Models\Post;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The post page (contract §2.6): PostSummary plus the article texts, gallery
 * and the links to the neighbouring posts.
 *
 * @property-read Post $resource
 */
final class PostDetailResource extends JsonResource
{
    public function __construct(Post $post, private readonly ?Post $previous, private readonly ?Post $next)
    {
        parent::__construct($post);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $post = $this->resource;

        return [
            ...(new PostSummaryResource($post))->toArray($request),
            'cover' => MediaUrl::for($post->cover_path),
            'body' => $post->bodyParagraphs(),
            'quote' => $post->quote,
            'gallery' => array_map(fn (string $path): ?string => MediaUrl::for($path), $post->gallery ?? []),
            'closing' => $post->closingParagraphs(),
            'previous' => $this->previous === null ? null : new PostLinkResource($this->previous),
            'next' => $this->next === null ? null : new PostLinkResource($this->next),
        ];
    }
}
