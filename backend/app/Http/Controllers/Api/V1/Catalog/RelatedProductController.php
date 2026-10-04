<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Catalog\ProductSummaryResource;
use App\Models\Product;
use App\Repositories\Catalog\ProductRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** `GET /products/{slug}/related`: the "Related products" carousel. */
final class RelatedProductController extends Controller
{
    private const int LIMIT = 9;

    public function __construct(private readonly ProductRepository $products) {}

    public function __invoke(Product $product): AnonymousResourceCollection
    {
        return ProductSummaryResource::collection($this->products->related($product, self::LIMIT));
    }
}
