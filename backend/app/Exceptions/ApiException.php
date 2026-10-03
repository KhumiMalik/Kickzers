<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Base class for expected, client-facing domain errors (out of stock, invalid
 * coupon, idempotency conflict…). They render as the API's error format
 * `{ message, code }` and are not reported to the logs, because they are part
 * of normal operation rather than bugs.
 */
abstract class ApiException extends RuntimeException implements ShouldntReport
{
    /** HTTP status of the response. */
    protected int $status = 400;

    /** Machine-readable error code, e.g. "idempotency_conflict". */
    protected ?string $errorCode = null;

    public function render(): JsonResponse
    {
        return response()->json(
            array_filter(['message' => $this->getMessage(), 'code' => $this->errorCode]),
            $this->status,
        );
    }
}
