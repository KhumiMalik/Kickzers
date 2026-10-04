<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Blog;

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Post;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

/**
 * A post card in the blog list (contract §2.6). Needs PostBuilder::withSummaryRelations().
 *
 * @property-read Post $resource
 */
final class PostSummaryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $post = $this->resource;
        // blog_author_id is NOT NULL with restrict-on-delete, so a missing author is a data bug.
        $author = $post->author ?? throw new LogicException("Post {$post->id} has no author.");

        return [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'image' => MediaUrl::for($post->image_path),
            'thumbnail' => MediaUrl::for($post->thumbnail_path),
            'author' => ['name' => $author->name],
            'published_at' => $post->published_at?->toIso8601ZuluString(),
            'views' => $post->views_count,
            'comments_count' => $post->approved_comments_count,
            'categories' => $post->categories
                ->map(fn (BlogCategory $category): array => ['slug' => $category->slug, 'name' => $category->name])
                ->all(),
            'tags' => $post->tags->map(fn (BlogTag $tag): array => ['slug' => $tag->slug, 'name' => $tag->name])->all(),
        ];
    }
}
