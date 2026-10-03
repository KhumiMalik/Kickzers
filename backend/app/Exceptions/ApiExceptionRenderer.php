<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Renders every error on /api/* as JSON `{ message }` (docs/api-contract.md §1.8).
 *
 * Validation (422) and authentication (401) errors are left to Laravel, whose
 * default JSON already matches the contract. Domain exceptions extending
 * ApiException render themselves before this callback runs.
 */
final class ApiExceptionRenderer
{
    public function __invoke(Throwable $exception, Request $request): ?JsonResponse
    {
        if (! $request->is('api/*')) {
            return null;
        }

        if ($exception instanceof ValidationException
            || $exception instanceof AuthenticationException
            || $exception instanceof HttpResponseException) {
            return null;
        }

        if ($exception instanceof HttpExceptionInterface) {
            return response()->json(
                ['message' => $this->messageFor($exception)],
                $exception->getStatusCode(),
                $exception->getHeaders(),
            );
        }

        // Unexpected errors: keep Laravel's detailed output while debugging, hide it otherwise.
        if (config('app.debug') === true) {
            return null;
        }

        return response()->json(['message' => 'Server error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    private function messageFor(HttpExceptionInterface $exception): string
    {
        $previous = $exception->getPrevious();

        return match (true) {
            // "Product not found." when route model binding fails, "Not found." for unknown URLs.
            $exception instanceof NotFoundHttpException => $previous instanceof ModelNotFoundException
                ? class_basename($previous->getModel()).' not found.'
                : 'Not found.',
            $exception instanceof MethodNotAllowedHttpException => 'Method not allowed.',
            $exception instanceof ThrottleRequestsException => sprintf(
                'Too many attempts. Please try again in %d seconds.',
                $exception->getHeaders()['Retry-After'] ?? 60,
            ),
            default => $exception->getMessage() !== ''
                ? $exception->getMessage()
                : (Response::$statusTexts[$exception->getStatusCode()] ?? 'Error.'),
        };
    }
}
