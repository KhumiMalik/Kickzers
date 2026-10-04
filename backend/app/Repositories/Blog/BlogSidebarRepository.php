<?php

declare(strict_types=1);

namespace App\Repositories\Blog;

use App\DTOs\Blog\BlogSidebar;
use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Builders\PostBuilder;

/**
 * Reads the blog sidebar widgets. Unlike the model repositories it spans
 * several small models (author, categories, tags), so it does not extend
 * BaseRepository; popular posts come from PostRepository.
 */
final readonly class BlogSidebarRepository
{
    public function __construct(private PostRepository $posts) {}

    public function sidebar(int $popularLimit = 4): BlogSidebar
    {
        return new BlogSidebar(
            author: BlogAuthor::query()->where('is_featured', true)->orderBy('id')->first(),
            popular: $this->posts->popular($popularLimit),
            categories: BlogCategory::query()
                ->withCount(['posts' => fn (PostBuilder $query) => $query->published()])
                ->orderBy('id')
                ->get(),
            tags: BlogTag::query()->orderBy('id')->get(),
            featuredCategories: BlogCategory::query()
                ->whereNotNull('featured_position')
                ->orderBy('featured_position')
                ->get(),
        );
    }
}
