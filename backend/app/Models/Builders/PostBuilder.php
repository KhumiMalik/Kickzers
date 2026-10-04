<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;

/**
 * Query builder for blog posts: the blog list filters (category, tag, q).
 *
 * @extends Builder<Post>
 */
final class PostBuilder extends Builder
{
    /** Posts whose publication date has arrived. */
    public function published(): self
    {
        return $this->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function inCategory(?string $slug): self
    {
        if ($slug === null || $slug === '') {
            return $this;
        }

        return $this->whereHas('categories', fn (Builder $query) => $query->where('slug', $slug));
    }

    public function withTag(?string $slug): self
    {
        if ($slug === null || $slug === '') {
            return $this;
        }

        return $this->whereHas('tags', fn (Builder $query) => $query->where('slug', $slug));
    }

    /** Case-insensitive search in the title and excerpt. */
    public function search(?string $term): self
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $this;
        }

        return $this->where(fn (self $query) => $query
            ->whereLike('title', "%{$term}%")
            ->orWhereLike('excerpt', "%{$term}%"));
    }

    /** Eager-loads what a post card (PostSummary) shows. */
    public function withSummaryRelations(): self
    {
        return $this->with(['author', 'categories', 'tags'])->withCount('approvedComments');
    }

    /** Newest first, with the primary key as a tie-breaker for stable pagination. */
    public function newestFirst(): self
    {
        return $this->orderByDesc('published_at')->orderByDesc('id');
    }
}
