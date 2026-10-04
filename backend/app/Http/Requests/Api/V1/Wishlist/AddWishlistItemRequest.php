<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Wishlist;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** `POST /wishlist` (contract §8): the product must exist and be published. */
final class AddWishlistItemRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $publishedStatuses = array_map(fn (ProductStatus $status): string => $status->value, ProductStatus::published());

        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->whereIn('status', $publishedStatuses),
            ],
        ];
    }

    public function productId(): int
    {
        return $this->integer('product_id');
    }
}
