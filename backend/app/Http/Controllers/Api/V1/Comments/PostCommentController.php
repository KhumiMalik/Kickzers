<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Comments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Comments\StoreCommentRequest;
use App\Http\Resources\Api\V1\Comments\CommentResource;
use App\Models\Post;
use App\Repositories\Content\CommentRepository;
use Illuminate\Http\JsonResponse;
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

    /** `POST /posts/{slug}/comments`: a new comment or a reply (201). */
    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        $comment = $this->comments->createFor($post, $request->author(), $request->body(), $request->subject(), $request->parentId());

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }
}
