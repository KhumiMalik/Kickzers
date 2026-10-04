<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Checkout;

use App\Contracts\PaymentGateway;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An enabled payment gateway as the checkout lists it.
 *
 * @property-read PaymentGateway $resource
 */
final class PaymentMethodResource extends JsonResource
{
    /** @return array{code: string, name: string, description: string, image: string|null} */
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->resource->method()->value,
            'name' => $this->resource->name(),
            'description' => $this->resource->description(),
            'image' => $this->resource->image(),
        ];
    }
}
