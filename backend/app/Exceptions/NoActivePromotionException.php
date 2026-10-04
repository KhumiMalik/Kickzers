<?php

declare(strict_types=1);

namespace App\Exceptions;

/** No promotion of the requested type is running right now (404). */
final class NoActivePromotionException extends ApiException
{
    protected int $status = 404;

    protected ?string $errorCode = 'no_active_promotion';

    public function __construct()
    {
        parent::__construct('No active promotion.');
    }
}
