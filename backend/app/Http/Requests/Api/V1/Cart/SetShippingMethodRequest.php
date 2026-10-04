<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cart;

use App\Enums\ShippingMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use LogicException;

/** `PUT /cart/shipping-method` (contract §9). Availability is checked by SetShippingMethod. */
final class SetShippingMethodRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'method' => ['required', Rule::enum(ShippingMethod::class)],
        ];
    }

    public function shippingMethod(): ShippingMethod
    {
        return $this->enum('method', ShippingMethod::class)
            ?? throw new LogicException('Called before validation passed.');
    }
}
