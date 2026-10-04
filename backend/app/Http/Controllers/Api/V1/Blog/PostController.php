<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Blog\ListPostsRequest;
use App\Http\Resources\Api\V1\Blog\PostDetailResource;
use App\Http\Resources\Api\V1\Blog\PostSummaryResource;
use App\Models\Post;
use App\Repositories\Blog\PostRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

use function Illuminate\Support\defer;

final class PostController extends Controller
{
    public function __construct(private readonly PostRepository $posts) {}

    /** `GET /posts`: the blog list, newest first. */
    public function index(ListPostsRequest $request): AnonymousResourceCollection
    {
        $posts = $this->posts
            ->search($request->filters(), $request->perPage())
            ->appends($request->query());

        return PostSummaryResource::collection($posts);
    }

    /**
     * `GET /posts/{slug}`: the post page. The view is counted after the
     * response has been sent (defer), so readers never wait for that UPDATE.
     */
    public function show(Post $post): PostDetailResource
    {
        defer(fn () => $this->posts->recordView($post));

        return new PostDetailResource(
            $this->posts->loadDetail($post),
            $this->posts->previous($post),
            $this->posts->next($post),
        );
    }
}
