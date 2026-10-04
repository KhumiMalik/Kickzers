<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Orders;

use App\Enums\AddressType;
use App\Models\OrderAddress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A billing or shipping address snapshot. Only the billing address carries
 * the e-mail (contract §2.8).
 *
 * @property-read OrderAddress $resource
 */
final class OrderAddressResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $address = $this->resource;

        return [
            'first_name' => $address->first_name,
            'last_name' => $address->last_name,
            'company' => $address->company,
            'phone' => $address->phone,
            ...($address->type === AddressType::Billing ? ['email' => $address->email] : []),
            'address_line_1' => $address->address_line_1,
            'address_line_2' => $address->address_line_2,
            'city' => $address->city,
            'state' => $address->state,
            'postcode' => $address->postcode,
            'country' => $address->country_code,
            'country_name' => $address->country_name,
        ];
    }
}
