<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Catalog;

use App\DTOs\Catalog\RatingSummary;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

/**
 * The product page (contract §2.3): ProductSummary plus gallery, texts,
 * specifications, rating and stock limit. Load it with ProductRepository::loadDetail().
 *
 * @property-read Product $resource
 */
final class ProductDetailResource extends JsonResource
{
    public function __construct(Product $product, private readonly RatingSummary $rating)
    {
        parent::__construct($product);
    }

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $product = $this->resource;
        // category_id is NOT NULL with restrict-on-delete, so a missing category is a data bug.
        $category = $product->category ?? throw new LogicException("Product {$product->id} has no category.");

        return [
            ...(new ProductSummaryResource($product))->toArray($request),
            'sku' => $product->sku,
            'short_description' => $product->short_description,
            'description' => $product->descriptionParagraphs(),
            'gallery' => $product->images->map(fn (ProductImage $image): ?string => MediaUrl::for($image->path))->all(),
            'specifications' => $product->specifications
                ->map(fn (ProductSpecification $spec): array => ['label' => $spec->label, 'value' => $spec->value])
                ->all(),
            'category' => [
                'slug' => $category->slug,
                'name' => $category->name,
                'parent' => $category->parent === null ? null : new TaxonomyResource($category->parent),
            ],
            'color' => new TaxonomyResource($product->color),
            'max_quantity' => $product->maxPurchasableQuantity(),
            'rating' => [
                'average' => $this->rating->average,
                'count' => $this->rating->count,
                // An object keeps the star numbers as keys ({"5": 1, …}); resources re-index
                // numeric-keyed arrays into a plain list.
                'breakdown' => (object) $this->rating->breakdown,
            ],
            'comments_count' => $product->approved_comments_count,
        ];
    }
}
