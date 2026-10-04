<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Wishlist;

use Illuminate\Foundation\Http\FormRequest;

/**
 * `POST /wishlist/merge` (contract §8): the ids from the guest's browser
 * wishlist. Only the shape is validated; ids of products that no longer
 * exist are skipped by the merge instead of failing the login flow.
 */
final class MergeWishlistRequest extends FormRequest
{
    public const int MAX_PRODUCTS = 100;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_ids' => ['present', 'array', 'max:'.self::MAX_PRODUCTS],
            'product_ids.*' => ['integer', 'min:1'],
        ];
    }

    /** @return list<int> */
    public function productIds(): array
    {
        return array_values(array_unique(array_map(intval(...), $this->array('product_ids'))));
    }
}
