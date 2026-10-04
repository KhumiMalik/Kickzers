<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Wishlist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Wishlist\MergeWishlistRequest;
use App\Http\Resources\Api\V1\Catalog\ProductSummaryResource;
use App\Models\User;
use App\Repositories\Wishlist\WishlistRepository;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * `POST /wishlist/merge`: called once right after login or registration with
 * the guest's browser wishlist; returns the combined wishlist.
 */
final class MergeWishlistController extends Controller
{
    public function __construct(private readonly WishlistRepository $wishlist) {}

    public function __invoke(MergeWishlistRequest $request, #[CurrentUser] User $user): AnonymousResourceCollection
    {
        $this->wishlist->merge($user, $request->productIds());

        return ProductSummaryResource::collection($this->wishlist->productsFor($user));
    }
}
