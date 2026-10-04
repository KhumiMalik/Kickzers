<?php

declare(strict_types=1);

namespace App\Actions\Checkout;

use App\Actions\Cart\CalculateCartTotals;
use App\Actions\Cart\CheckCoupon;
use App\Actions\Cart\EmptyCart;
use App\Actions\Cart\QuoteShippingOptions;
use App\Actions\Orders\GenerateOrderNumber;
use App\DTOs\Cart\CartTotals;
use App\DTOs\Cart\ShippingOption;
use App\DTOs\Checkout\AddressData;
use App\DTOs\Checkout\CheckoutData;
use App\DTOs\Checkout\PlacedOrder;
use App\Enums\AddressType;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPlaced;
use App\Exceptions\CheckoutException;
use App\Exceptions\IdempotencyException;
use App\Models\Cart;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\Cart\CartRepository;
use App\Repositories\Orders\OrderRepository;
use App\Services\Payments\PaymentGatewayRegistry;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use LogicException;

/**
 * Turns the cart into an order (contract §10.1), all or nothing.
 *
 * Inside one transaction it locks the cart, the products and the coupon
 * (SELECT … FOR UPDATE), so two customers buying the last pair cannot both
 * succeed and a coupon cannot be used past its limit. It re-checks every
 * rule, recalculates the totals, writes the order with snapshots of names,
 * prices and addresses, takes the stock, records the coupon use, asks the
 * payment gateway for the statuses and empties the cart. Any failure rolls
 * everything back.
 *
 * The Idempotency-Key makes retries safe: a key that already placed an order
 * returns that order instead of placing a second one.
 */
final readonly class PlaceOrder
{
    public function __construct(
        private CartRepository $carts,
        private OrderRepository $orders,
        private QuoteShippingOptions $quoteShipping,
        private CheckCoupon $checkCoupon,
        private CalculateCartTotals $calculateTotals,
        private GenerateOrderNumber $generateOrderNumber,
        private EmptyCart $emptyCart,
        private PaymentGatewayRegistry $gateways,
    ) {}

    /**
     * @throws CheckoutException when the cart cannot be ordered as it is (422)
     * @throws IdempotencyException when the key belongs to another customer's order (409)
     */
    public function handle(Cart $cart, CheckoutData $data, ?User $customer): PlacedOrder
    {
        $previous = $this->orders->findByIdempotencyKey($data->idempotencyKey);

        if ($previous !== null) {
            return $this->replay($previous, $data, $customer);
        }

        try {
            return DB::transaction(fn (): PlacedOrder => $this->place($cart, $data, $customer));
        } catch (UniqueConstraintViolationException $exception) {
            // A simultaneous request with the same key committed first (unique idempotency_key).
            $previous = $this->orders->findByIdempotencyKey($data->idempotencyKey);

            if ($previous === null) {
                throw $exception;
            }

            return $this->replay($previous, $data, $customer);
        }
    }

    private function place(Cart $cart, CheckoutData $data, ?User $customer): PlacedOrder
    {
        if (! $cart->exists) {
            throw CheckoutException::emptyCart();
        }

        $cart = $this->carts->lock($cart)->load('items');

        if ($cart->items->isEmpty()) {
            throw CheckoutException::emptyCart();
        }

        $this->lockAndCheckProducts($cart);
        $shipping = $this->selectedShipping($cart, $data->shipping->countryCode);
        $coupon = $this->lockCoupon($cart);
        $totals = $this->calculateTotals->handle($cart, [$shipping]);

        if ($coupon !== null) {
            $violation = $this->checkCoupon->violation($coupon, $totals->subtotal);

            if ($violation !== null) {
                throw CheckoutException::couponRejected($violation);
            }
        }

        $gateway = $this->gateways->find($data->paymentMethod) ?? throw CheckoutException::paymentMethodUnavailable();
        $account = $customer === null && $data->createAccount ? $this->createAccount($data) : null;

        $order = $this->createOrder($data, $totals, $shipping, $coupon, $customer ?? $account);

        foreach ($totals->lines as $line) {
            $line->product->decrement('stock_quantity', $line->item->quantity);
        }

        if ($coupon !== null) {
            $order->couponRedemption()->create([
                'coupon_id' => $coupon->id,
                'user_id' => $order->user_id,
                'email' => $order->email,
                'discount_amount' => $totals->discount,
            ]);
            $coupon->increment('times_used');
        }

        $payment = $gateway->process($order);
        $order->update(['status' => $payment->orderStatus, 'payment_status' => $payment->paymentStatus]);

        $this->emptyCart->handle($cart);

        // Implements ShouldDispatchAfterCommit: the e-mail is only queued if this transaction commits.
        OrderPlaced::dispatch($order);

        return new PlacedOrder($order, replayed: false, createdAccount: $account);
    }

    /** Same key again: the original order for the same customer, 409 for anyone else. */
    private function replay(Order $order, CheckoutData $data, ?User $customer): PlacedOrder
    {
        $sameCustomer = $customer !== null
            ? $order->user_id === $customer->id
            : $order->email === $data->email;

        if (! $sameCustomer) {
            throw IdempotencyException::conflict();
        }

        return new PlacedOrder($order, replayed: true);
    }

    /**
     * Locks the products in id order (a fixed order avoids deadlocks between two
     * checkouts) and checks each line against the locked, current stock.
     */
    private function lockAndCheckProducts(Cart $cart): void
    {
        $products = Product::query()
            ->whereKey($cart->items->pluck('product_id')->all())
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($cart->items as $item) {
            // Cart items cascade-delete with their product, so the product always exists.
            $product = $products->get($item->product_id) ?? throw new LogicException("Cart item {$item->id} has no product.");

            if (! $product->isPurchasable()) {
                throw CheckoutException::productUnavailable($product);
            }

            if ($item->quantity > $product->stock_quantity) {
                throw CheckoutException::notEnoughStock($product);
            }

            $item->setRelation('product', $product);
        }
    }

    /**
     * The cart's shipping method as offered for the shipping address country
     * (Local Delivery is domestic only), with the price for that country.
     */
    private function selectedShipping(Cart $cart, string $countryCode): ShippingOption
    {
        foreach ($this->quoteShipping->handle($countryCode) as $option) {
            if ($option->method === $cart->shipping_method) {
                return $option;
            }
        }

        $countryName = Country::query()->whereKey($countryCode)->value('name');

        throw CheckoutException::shippingUnavailable(is_string($countryName) ? $countryName : $countryCode);
    }

    private function lockCoupon(Cart $cart): ?Coupon
    {
        $coupon = $cart->coupon_id === null ? null : Coupon::query()->lockForUpdate()->find($cart->coupon_id);
        $cart->setRelation('coupon', $coupon);

        return $coupon;
    }

    /** "Create an account?" at checkout. Logging in happens after the commit (controller). */
    private function createAccount(CheckoutData $data): User
    {
        $user = User::query()->create([
            'name' => trim("{$data->billing->firstName} {$data->billing->lastName}"),
            'email' => $data->email,
            // Hashed by the "hashed" cast on User.
            'password' => $data->password,
        ]);

        DB::afterCommit(fn () => event(new Registered($user)));

        return $user;
    }

    private function createOrder(CheckoutData $data, CartTotals $totals, ShippingOption $shipping, ?Coupon $coupon, ?User $owner): Order
    {
        $order = $this->orders->create([
            'user_id' => $owner?->id,
            'idempotency_key' => $data->idempotencyKey,
            // Final statuses come from the payment gateway below.
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'payment_method' => $data->paymentMethod,
            'email' => $data->email,
            'currency' => config()->string('shop.currency'),
            'subtotal' => $totals->subtotal,
            'discount' => $totals->discount,
            'shipping_total' => $totals->shipping,
            'total' => $totals->total,
            'coupon_code' => $coupon?->code,
            'shipping_method' => $shipping->method,
            'shipping_method_name' => $shipping->method->label(),
            'notes' => $data->notes,
            'placed_at' => now(),
        ]);

        $order->update(['number' => $this->generateOrderNumber->handle($order)]);

        foreach ($totals->lines as $line) {
            $order->items()->create([
                'product_id' => $line->product->id,
                'product_name' => $line->product->name,
                'product_slug' => $line->product->slug,
                'sku' => $line->product->sku,
                'unit_price' => $line->unitPrice,
                'quantity' => $line->item->quantity,
                'line_total' => $line->lineTotal,
            ]);
        }

        $countryNames = Country::query()
            ->whereKey([$data->billing->countryCode, $data->shipping->countryCode])
            ->pluck('name', 'code');

        $this->createAddress($order, AddressType::Billing, $data->billing, $countryNames->get($data->billing->countryCode));
        $this->createAddress($order, AddressType::Shipping, $data->shipping, $countryNames->get($data->shipping->countryCode));

        return $order;
    }

    private function createAddress(Order $order, AddressType $type, AddressData $address, mixed $countryName): void
    {
        $order->addresses()->create([
            'type' => $type,
            'first_name' => $address->firstName,
            'last_name' => $address->lastName,
            'company' => $address->company,
            'phone' => $address->phone,
            'email' => $address->email,
            'country_code' => $address->countryCode,
            'country_name' => is_string($countryName) ? $countryName : $address->countryCode,
            'state' => $address->state,
            'city' => $address->city,
            'address_line_1' => $address->addressLine1,
            'address_line_2' => $address->addressLine2,
            'postcode' => $address->postcode,
        ]);
    }
}
