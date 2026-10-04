<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Services\Money;
use Illuminate\Http\JsonResponse;

/**
 * A cart change that breaks a business rule (stock, availability, coupon,
 * shipping). It is rendered exactly like a validation error on `$field`, so
 * the frontend shows it next to the right input:
 *
 *   422 { "message": "…", "errors": { "quantity": ["Only 3 of … left in stock."] } }
 *
 * The named constructors keep every customer-facing message in one place.
 */
final class CartException extends ApiException
{
    protected int $status = 422;

    private function __construct(public readonly string $field, string $message)
    {
        parent::__construct($message);
    }

    /** A published product that cannot be bought right now. */
    public static function notPurchasable(Product $product): self
    {
        $reason = $product->status === ProductStatus::ComingSoon ? 'is coming soon.' : 'is out of stock.';

        return new self('product_id', "{$product->name} {$reason}");
    }

    public static function notEnoughStock(Product $product): self
    {
        return new self('quantity', "Only {$product->stock_quantity} of {$product->name} left in stock.");
    }

    public static function quantityLimit(int $limit): self
    {
        return new self('quantity', "You can order at most {$limit} of one product.");
    }

    public static function invalidCoupon(): self
    {
        return new self('code', 'This coupon code is not valid.');
    }

    public static function couponNotStarted(): self
    {
        return new self('code', 'This coupon is not valid yet.');
    }

    public static function couponExpired(): self
    {
        return new self('code', 'This coupon has expired.');
    }

    public static function couponUsedUp(): self
    {
        return new self('code', 'This coupon has reached its usage limit.');
    }

    public static function couponMinimumNotMet(int $minimumSubtotal): self
    {
        return new self('code', 'Spend '.Money::format($minimumSubtotal).' or more to use this coupon.');
    }

    public static function shippingUnavailable(): self
    {
        return new self('method', 'This shipping method is not available for your destination.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => [$this->field => [$this->getMessage()]],
        ], $this->status);
    }
}
