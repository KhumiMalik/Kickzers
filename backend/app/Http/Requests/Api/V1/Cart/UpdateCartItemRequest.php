<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cart;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

/** `PATCH /cart/items/{itemId}` (contract §9). */
final class UpdateCartItemRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:'.Product::MAX_QUANTITY_PER_ORDER],
        ];
    }

    public function quantity(): int
    {
        return $this->integer('quantity');
    }
}
