<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Blog;

use App\DTOs\Blog\PostFilters;
use Illuminate\Foundation\Http\FormRequest;

/** Query string of `GET /posts` (contract §7). */
final class ListPostsRequest extends FormRequest
{
    public const int MAX_PER_PAGE = 20;

    public const int DEFAULT_PER_PAGE = 5;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:100'],
            'tag' => ['nullable', 'string', 'max:100'],
            'q' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): PostFilters
    {
        return new PostFilters(
            category: $this->string('category')->toString() ?: null,
            tag: $this->string('tag')->toString() ?: null,
            search: $this->string('q')->trim()->toString() ?: null,
        );
    }

    public function perPage(): int
    {
        return $this->integer('per_page', self::DEFAULT_PER_PAGE);
    }
}
