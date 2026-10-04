<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Reviews;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Reviews\ListReviewsRequest;
use App\Http\Requests\Api\V1\Reviews\StoreReviewRequest;
use App\Http\Resources\Api\V1\Reviews\ReviewResource;
use App\Models\Product;
use App\Repositories\Content\ReviewRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProductReviewController extends Controller
{
    public function __construct(private readonly ReviewRepository $reviews) {}

    /** `GET /products/{slug}/reviews`: approved reviews, newest first. */
    public function index(ListReviewsRequest $request, Product $product): AnonymousResourceCollection
    {
        $reviews = $this->reviews
            ->approvedFor($product, $request->perPage())
            ->appends($request->query());

        return ReviewResource::collection($reviews);
    }

    /** `POST /products/{slug}/reviews`: publishes a review (201). */
    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $review = $this->reviews->createFor($product, $request->author(), $request->rating(), $request->body());

        return (new ReviewResource($review))->response()->setStatusCode(201);
    }
}
