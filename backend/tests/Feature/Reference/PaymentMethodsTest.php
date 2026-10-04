<?php

declare(strict_types=1);

use App\Contracts\PaymentGateway;
use App\Enums\PaymentMethod;
use App\Services\Payments\CashOnDeliveryGateway;
use App\Services\Payments\PaymentGatewayRegistry;

it('lists the enabled gateways in checkout order', function (): void {
    $this->getJson(route('api.v1.payment-methods.index'))
        ->assertOk()
        ->assertExactJson(['data' => [
            [
                'code' => 'cash_on_delivery',
                'name' => 'Cash on delivery',
                'description' => 'Pay with cash when your order is delivered.',
                'image' => null,
            ],
            [
                'code' => 'check',
                'name' => 'Check payments',
                'description' => 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.',
                'image' => null,
            ],
        ]]);
});

it('lists only what the registry enables', function (): void {
    $this->app->instance(PaymentGatewayRegistry::class, new PaymentGatewayRegistry(new CashOnDeliveryGateway));

    $this->getJson(route('api.v1.payment-methods.index'))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', 'cash_on_delivery');
});

it('finds a gateway by payment method', function (): void {
    $registry = new PaymentGatewayRegistry(new CashOnDeliveryGateway);

    expect($registry->find(PaymentMethod::CashOnDelivery))->toBeInstanceOf(PaymentGateway::class)
        ->and($registry->find(PaymentMethod::Check))->toBeNull();
});
