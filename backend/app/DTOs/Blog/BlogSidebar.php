<?php

declare(strict_types=1);

namespace App\DTOs\Blog;

use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Post;
use Illuminate\Database\Eloquent\Collection;

/** The blog sidebar widgets and the featured category cards (`GET /blog/sidebar`). */
final readonly class BlogSidebar
{
    /**
     * @param  Collection<int, Post>  $popular
     * @param  Collection<int, BlogCategory>  $categories  with `posts_count`
     * @param  Collection<int, BlogTag>  $tags
     * @param  Collection<int, BlogCategory>  $featuredCategories
     */
    public function __construct(
        public ?BlogAuthor $author,
        public Collection $popular,
        public Collection $categories,
        public Collection $tags,
        public Collection $featuredCategories,
    ) {}
}
