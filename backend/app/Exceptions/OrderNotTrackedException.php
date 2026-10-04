<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * No order matches the tracking form (contract §10.2). One message for a
 * wrong number and a wrong email, so the form cannot be used to discover
 * which order numbers exist.
 */
final class OrderNotTrackedException extends ApiException
{
    protected int $status = 404;

    protected ?string $errorCode = 'order_not_found';

    public function __construct()
    {
        parent::__construct('No order matches that order number and billing email.');
    }
}
