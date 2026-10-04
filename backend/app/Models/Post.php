<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\PostBuilder;
use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\UseEloquentBuilder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * A blog post. `body` and `closing` hold paragraphs separated by blank lines;
 * image paths are relative to the "public" storage disk.
 *
 * @method static PostBuilder query()
 */
#[Fillable([
    'blog_author_id', 'title', 'slug', 'excerpt', 'body', 'quote', 'closing', 'image_path', 'thumbnail_path',
    'cover_path', 'gallery', 'views_count', 'published_at',
])]
#[RouteKey('slug')]
#[UseEloquentBuilder(PostBuilder::class)]
final class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    /** @return BelongsTo<BlogAuthor, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(BlogAuthor::class, 'blog_author_id');
    }

    /** @return BelongsToMany<BlogCategory, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_category_post');
    }

    /** @return BelongsToMany<BlogTag, $this> */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_tag_post');
    }

    /** @return MorphMany<Comment, $this> */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'views_count' => 'integer',
            'published_at' => 'datetime',
        ];
    }
}
