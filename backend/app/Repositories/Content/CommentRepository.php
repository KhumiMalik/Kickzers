<?php

declare(strict_types=1);

namespace App\Repositories\Content;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Product;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<Comment>
 */
final class CommentRepository extends BaseRepository
{
    protected string $model = Comment::class;

    /**
     * Approved top-level comments of a product or post, oldest first, each
     * with its approved replies (also oldest first).
     *
     * @return LengthAwarePaginator<int, Comment>
     */
    public function threadsFor(Product|Post $commentable, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->whereMorphedTo('commentable', $commentable)
            ->topLevel()
            ->approved()
            ->with('approvedReplies')
            ->oldest()
            ->orderBy('id')
            ->paginate($perPage);
    }
}
