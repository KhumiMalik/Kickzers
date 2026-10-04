<?php

declare(strict_types=1);

namespace App\DTOs\Checkout;

/** A validated checkout address. Shipping addresses carry no phone or e-mail. */
final readonly class AddressData
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public ?string $company,
        public ?string $phone,
        public ?string $email,
        public string $countryCode,
        public ?string $state,
        public string $city,
        public string $addressLine1,
        public ?string $addressLine2,
        public ?string $postcode,
    ) {}

    /** The same address used for shipping (no contact details). */
    public function withoutContact(): self
    {
        return new self(
            $this->firstName, $this->lastName, $this->company, null, null, $this->countryCode,
            $this->state, $this->city, $this->addressLine1, $this->addressLine2, $this->postcode,
        );
    }
}
