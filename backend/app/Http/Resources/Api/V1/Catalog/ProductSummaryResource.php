<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product card: lists, home blocks, related products, deals (contract §2.2).
 * Needs `primaryImage`, `category` and `brand` loaded (ProductBuilder::withSummaryRelations).
 *
 * @property-read Product $resource
 */
final class ProductSummaryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $product = $this->resource;

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'image' => MediaUrl::for($product->primaryImage?->path),
            'price' => $product->price,
            'compare_at_price' => $product->compare_at_price,
            'currency' => config('shop.currency'),
            'is_in_stock' => $product->isPurchasable(),
            'is_coming_soon' => $product->status === ProductStatus::ComingSoon,
            'category' => new TaxonomyResource($product->category),
            'brand' => new TaxonomyResource($product->brand),
        ];
    }
}
