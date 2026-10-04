<?php

declare(strict_types=1);

namespace App\DTOs\Content;

/**
 * Who wrote a review or comment. The e-mail and phone are stored for the
 * shop's own use and never returned by the API.
 */
final readonly class AuthorData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $phone,
        public ?int $userId,
    ) {}
}
