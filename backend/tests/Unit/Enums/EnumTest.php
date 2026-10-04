<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ProductStatus;
use App\Enums\ShippingMethod;

it('labels shipping methods like the template', function (ShippingMethod $method, string $label): void {
    expect($method->label())->toBe($label);
})->with([
    [ShippingMethod::FlatRate5, 'Flat Rate'],
    [ShippingMethod::Free, 'Free Shipping'],
    [ShippingMethod::FlatRate10, 'Flat Rate'],
    [ShippingMethod::LocalDelivery, 'Local Delivery'],
]);

it('offers local delivery in the store country only', function (): void {
    expect(ShippingMethod::LocalDelivery->isDomesticOnly())->toBeTrue()
        ->and(ShippingMethod::FlatRate5->isDomesticOnly())->toBeFalse()
        ->and(ShippingMethod::Free->isDomesticOnly())->toBeFalse()
        ->and(ShippingMethod::FlatRate10->isDomesticOnly())->toBeFalse();
});

it('labels and describes the payment methods', function (): void {
    expect(PaymentMethod::CashOnDelivery->label())->toBe('Cash on delivery')
        ->and(PaymentMethod::Check->label())->toBe('Check payments')
        ->and(PaymentMethod::CashOnDelivery->description())->toBe('Pay with cash when your order is delivered.');
});

it('labels order statuses for customers', function (): void {
    expect(OrderStatus::Processing->label())->toBe('Processing')
        ->and(OrderStatus::Cancelled->label())->toBe('Cancelled');
});

it('treats active and coming-soon products as published', function (): void {
    expect(ProductStatus::published())->toBe([ProductStatus::Active, ProductStatus::ComingSoon])
        ->and(ProductStatus::Draft->isPublished())->toBeFalse()
        ->and(ProductStatus::ComingSoon->isPublished())->toBeTrue();
});
