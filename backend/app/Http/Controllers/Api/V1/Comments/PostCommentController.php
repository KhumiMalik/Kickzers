<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Comments;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Comments\CommentResource;
use App\Models\Post;
use App\Repositories\Content\CommentRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class PostCommentController extends Controller
{
    /** Top-level comments per page; their replies are always included. */
    public const int PER_PAGE = 20;

    public function __construct(private readonly CommentRepository $comments) {}

    /** `GET /posts/{slug}/comments`: comment threads, oldest first. */
    public function index(Post $post): AnonymousResourceCollection
    {
        return CommentResource::collection($this->comments->threadsFor($post, self::PER_PAGE));
    }
}
