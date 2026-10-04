<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Wishlist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Wishlist\AddWishlistItemRequest;
use App\Http\Resources\Api\V1\Catalog\ProductSummaryResource;
use App\Models\User;
use App\Repositories\Catalog\ProductRepository;
use App\Repositories\Wishlist\WishlistRepository;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/** The logged-in customer's wishlist (`/wishlist`). Every query is scoped to the current user. */
final class WishlistController extends Controller
{
    public function __construct(
        private readonly WishlistRepository $wishlist,
        private readonly ProductRepository $products,
    ) {}

    public function index(#[CurrentUser] User $user): AnonymousResourceCollection
    {
        return ProductSummaryResource::collection($this->wishlist->productsFor($user));
    }

    /** 201 when the product is newly saved, 200 when it already was. */
    public function store(AddWishlistItemRequest $request, #[CurrentUser] User $user): JsonResponse
    {
        $product = $this->products->findPublishedSummary($request->productId());
        $added = $this->wishlist->add($user, $product);

        return (new ProductSummaryResource($product))->response()->setStatusCode($added ? 201 : 200);
    }

    /** Always 204: removing a product that was not saved leaves the same end state. */
    public function destroy(int $productId, #[CurrentUser] User $user): Response
    {
        $this->wishlist->remove($user, $productId);

        return response()->noContent();
    }
}
