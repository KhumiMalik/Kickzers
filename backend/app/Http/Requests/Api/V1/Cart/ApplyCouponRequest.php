<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cart;

use Illuminate\Foundation\Http\FormRequest;

/** `POST /cart/coupon` (contract §9). Whether the code is usable is checked by ApplyCoupon. */
final class ApplyCouponRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return ['code.required' => 'Please enter a coupon code.'];
    }

    public function code(): string
    {
        return $this->string('code')->trim()->toString();
    }
}
