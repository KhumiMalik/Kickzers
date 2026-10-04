<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Problems with the checkout's Idempotency-Key header (contract §1.10).
 */
final class IdempotencyException extends ApiException
{
    private function __construct(string $message, int $status, string $errorCode)
    {
        parent::__construct($message);

        $this->status = $status;
        $this->errorCode = $errorCode;
    }

    /** 400: the header is missing or not a UUID. */
    public static function missingKey(): self
    {
        return new self('The Idempotency-Key header must be a UUID.', 400, 'idempotency_key_missing');
    }

    /** 409: the key already placed an order for another customer. */
    public static function conflict(): self
    {
        return new self('This checkout was already submitted.', 409, 'idempotency_conflict');
    }
}
