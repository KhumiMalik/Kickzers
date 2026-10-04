<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Blog;

use App\DTOs\Blog\BlogSidebar;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * `GET /blog/sidebar` (contract §7).
 *
 * @property-read BlogSidebar $resource
 */
final class BlogSidebarResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $sidebar = $this->resource;
        $author = $sidebar->author;

        return [
            'author' => $author === null ? null : [
                'name' => $author->name,
                'role' => $author->role,
                'avatar' => MediaUrl::for($author->avatar_path),
                'bio' => $author->bio,
            ],
            'popular' => PostLinkResource::collection($sidebar->popular),
            'categories' => $sidebar->categories->map(fn (BlogCategory $category): array => [
                'slug' => $category->slug,
                'name' => $category->name,
                'posts_count' => $category->posts_count,
            ])->all(),
            'tags' => $sidebar->tags->map(fn (BlogTag $tag): array => ['slug' => $tag->slug, 'name' => $tag->name])->all(),
            'featured_categories' => $sidebar->featuredCategories->map(fn (BlogCategory $category): array => [
                'slug' => $category->slug,
                'name' => $category->featured_title ?? $category->name,
                'tagline' => $category->featured_tagline,
                'image' => MediaUrl::for($category->featured_image_path),
            ])->all(),
        ];
    }
}
