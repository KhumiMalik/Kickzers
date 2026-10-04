<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Comments;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Comments\StoreCommentRequest;
use App\Http\Resources\Api\V1\Comments\CommentResource;
use App\Models\Product;
use App\Repositories\Content\CommentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProductCommentController extends Controller
{
    /** Top-level comments per page; their replies are always included. */
    public const int PER_PAGE = 20;

    public function __construct(private readonly CommentRepository $comments) {}

    /** `GET /products/{slug}/comments`: comment threads, oldest first. */
    public function index(Product $product): AnonymousResourceCollection
    {
        return CommentResource::collection($this->comments->threadsFor($product, self::PER_PAGE));
    }

    /** `POST /products/{slug}/comments`: a new comment or a reply (201). */
    public function store(StoreCommentRequest $request, Product $product): JsonResponse
    {
        $comment = $this->comments->createFor($product, $request->author(), $request->body(), null, $request->parentId());

        return (new CommentResource($comment))->response()->setStatusCode(201);
    }
}
