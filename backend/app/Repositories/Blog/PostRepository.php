<?php

declare(strict_types=1);

namespace App\Repositories\Blog;

use App\DTOs\Blog\PostFilters;
use App\Models\Builders\PostBuilder;
use App\Models\Post;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Post>
 */
final class PostRepository extends BaseRepository
{
    protected string $model = Post::class;

    /** Narrows the return type so the blog scopes of PostBuilder are available. */
    public function query(): PostBuilder
    {
        return Post::query();
    }

    /**
     * The blog list: published posts matching the filters, newest first.
     *
     * @return LengthAwarePaginator<int, Post>
     */
    public function search(PostFilters $filters, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->published()
            ->inCategory($filters->category)
            ->withTag($filters->tag)
            ->search($filters->search)
            ->newestFirst()
            ->withSummaryRelations()
            ->paginate($perPage);
    }

    /** A published post by slug (drafts and scheduled posts are not found). */
    public function findPublishedBySlug(string $slug): Post
    {
        return $this->query()->published()->where('slug', $slug)->firstOrFail();
    }

    /** Loads everything the post page shows (PostDetail). */
    public function loadDetail(Post $post): Post
    {
        return $post->load(['author', 'categories', 'tags'])->loadCount('approvedComments');
    }

    /** The next-older published post ("Prev Post"), in the same order as the blog list. */
    public function previous(Post $post): ?Post
    {
        return $this->query()
            ->published()
            ->where(fn (PostBuilder $query) => $query
                ->where('published_at', '<', $post->published_at)
                ->orWhere(fn (PostBuilder $sameTime) => $sameTime
                    ->where('published_at', $post->published_at)
                    ->where('id', '<', $post->id)))
            ->newestFirst()
            ->first();
    }

    /** The next-newer published post ("Next Post"). */
    public function next(Post $post): ?Post
    {
        return $this->query()
            ->published()
            ->where(fn (PostBuilder $query) => $query
                ->where('published_at', '>', $post->published_at)
                ->orWhere(fn (PostBuilder $sameTime) => $sameTime
                    ->where('published_at', $post->published_at)
                    ->where('id', '>', $post->id)))
            ->orderBy('published_at')
            ->orderBy('id')
            ->first();
    }

    /**
     * Most-viewed published posts (sidebar "Popular Posts").
     *
     * @return Collection<int, Post>
     */
    public function popular(int $limit): Collection
    {
        return $this->query()->published()->orderByDesc('views_count')->orderByDesc('id')->limit($limit)->get();
    }

    /**
     * Counts one view. Runs on the query builder so it is a single atomic
     * UPDATE … SET views_count = views_count + 1 and does not touch updated_at.
     */
    public function recordView(Post $post): void
    {
        $this->query()->whereKey($post->id)->toBase()->increment('views_count');
    }
}
