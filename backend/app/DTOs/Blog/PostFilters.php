<?php

declare(strict_types=1);

namespace App\DTOs\Blog;

/** The validated blog list filters of `GET /posts`. */
final readonly class PostFilters
{
    public function __construct(
        public ?string $category = null,
        public ?string $tag = null,
        public ?string $search = null,
    ) {}
}
