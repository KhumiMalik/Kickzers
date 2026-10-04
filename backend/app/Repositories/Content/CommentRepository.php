<?php

declare(strict_types=1);

namespace App\Repositories\Content;

use App\DTOs\Content\AuthorData;
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

    public function createFor(Product|Post $commentable, AuthorData $author, string $body, ?string $subject, ?int $parentId): Comment
    {
        $comment = $commentable->comments()->create([
            'parent_id' => $parentId,
            'user_id' => $author->userId,
            'author_name' => $author->name,
            'author_email' => $author->email,
            'author_phone' => $author->phone,
            'subject' => $subject,
            'body' => $body,
            // Published straight away (decision Q8); the column lets moderation be switched on later.
            'is_approved' => true,
        ]);

        // A new comment has no replies yet; set that so the resource never queries for them.
        return $comment->setRelation('approvedReplies', $comment->newCollection());
    }

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
