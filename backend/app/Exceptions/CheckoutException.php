<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Models\Product;
use Illuminate\Http\JsonResponse;

/**
 * The cart cannot be turned into an order as it is (contract §10.1). Like a
 * validation error it is a 422, keyed `cart` or `coupon`, and nothing has
 * been written: PlaceOrder throws inside its transaction.
 */
final class CheckoutException extends ApiException
{
    protected int $status = 422;

    private function __construct(public readonly string $field, string $message)
    {
        parent::__construct($message);
    }

    public static function emptyCart(): self
    {
        return new self('cart', 'Your cart is empty.');
    }

    public static function productUnavailable(Product $product): self
    {
        return new self('cart', "{$product->name} is no longer available.");
    }

    public static function notEnoughStock(Product $product): self
    {
        return new self('cart', "{$product->name} has only {$product->stock_quantity} left in stock.");
    }

    public static function shippingUnavailable(string $countryName): self
    {
        return new self('cart', "The selected shipping method is not available for {$countryName}.");
    }

    public static function couponRejected(CartException $reason): self
    {
        return new self('coupon', $reason->getMessage());
    }

    public static function paymentMethodUnavailable(): self
    {
        return new self('payment_method', 'Please choose a payment method.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => [$this->field => [$this->getMessage()]],
        ], $this->status);
    }
}
