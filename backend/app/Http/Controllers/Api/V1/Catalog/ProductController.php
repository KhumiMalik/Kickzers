<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Catalog\ListProductsRequest;
use App\Http\Resources\Api\V1\Catalog\ProductDetailResource;
use App\Http\Resources\Api\V1\Catalog\ProductSummaryResource;
use App\Models\Product;
use App\Repositories\Catalog\ProductRepository;
use App\Repositories\Content\ReviewRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProductController extends Controller
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly ReviewRepository $reviews,
    ) {}

    /** `GET /products`: the shop listing, filtered, sorted and paginated. */
    public function index(ListProductsRequest $request): AnonymousResourceCollection
    {
        $products = $this->products
            ->search($request->filters(), $request->perPage())
            ->appends($request->query());

        return ProductSummaryResource::collection($products);
    }

    /** `GET /products/{slug}`: the product page ({product} only resolves published products). */
    public function show(Product $product): ProductDetailResource
    {
        return new ProductDetailResource(
            $this->products->loadDetail($product),
            $this->reviews->ratingSummaryFor($product),
        );
    }
}
