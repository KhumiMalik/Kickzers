<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Checkout;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Checkout\PaymentMethodResource;
use App\Services\Payments\PaymentGatewayRegistry;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** `GET /payment-methods`: the enabled payment gateways, in checkout order. */
final class PaymentMethodController extends Controller
{
    public function __construct(private readonly PaymentGatewayRegistry $gateways) {}

    public function __invoke(): AnonymousResourceCollection
    {
        return PaymentMethodResource::collection($this->gateways->enabled());
    }
}
