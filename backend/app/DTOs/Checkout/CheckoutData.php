<?php

declare(strict_types=1);

namespace App\DTOs\Checkout;

use App\Enums\PaymentMethod;

/** The validated checkout form (contract §10.1), built by CheckoutRequest. */
final readonly class CheckoutData
{
    public function __construct(
        public string $idempotencyKey,
        /** The billing e-mail, lower-cased: orders are tracked and replayed by it. */
        public string $email,
        public AddressData $billing,
        public AddressData $shipping,
        public ?string $notes,
        public PaymentMethod $paymentMethod,
        /** Only true for guests who asked for an account; then $password is set. */
        public bool $createAccount,
        public ?string $password,
    ) {}
}
