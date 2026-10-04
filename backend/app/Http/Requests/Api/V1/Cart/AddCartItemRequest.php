<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cart;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * `POST /cart/items` (contract §9). The product must be published; whether
 * it can be bought right now (coming soon, stock) is checked by AddCartItem.
 */
final class AddCartItemRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $publishedStatuses = array_map(fn (ProductStatus $status): string => $status->value, ProductStatus::published());

        return [
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->whereIn('status', $publishedStatuses)],
            'quantity' => ['required', 'integer', 'min:1', 'max:'.Product::MAX_QUANTITY_PER_ORDER],
        ];
    }

    public function productId(): int
    {
        return $this->integer('product_id');
    }

    public function quantity(): int
    {
        return $this->integer('quantity');
    }
}
