<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Catalog;

use App\DTOs\Catalog\ProductFilters;
use App\Enums\ProductSort;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Query string of `GET /products` (contract §5.2). Unknown slugs are not an
 * error (they simply match nothing); invalid sort, page size or prices are.
 */
final class ListProductsRequest extends FormRequest
{
    /** Page sizes the shop's "Show" dropdown offers. */
    public const array PER_PAGE_OPTIONS = [6, 12, 24];

    public const int DEFAULT_PER_PAGE = 12;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'min_price' => ['nullable', 'integer', 'min:0'],
            'max_price' => ['nullable', 'integer', 'min:0', Rule::when($this->filled('min_price'), 'gte:min_price')],
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::enum(ProductSort::class)],
            'per_page' => ['nullable', 'integer', Rule::in(self::PER_PAGE_OPTIONS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): ProductFilters
    {
        return new ProductFilters(
            category: $this->string('category')->toString() ?: null,
            brand: $this->string('brand')->toString() ?: null,
            color: $this->string('color')->toString() ?: null,
            minPrice: $this->filled('min_price') ? $this->integer('min_price') : null,
            maxPrice: $this->filled('max_price') ? $this->integer('max_price') : null,
            search: $this->string('q')->trim()->toString() ?: null,
            sort: $this->enum('sort', ProductSort::class) ?? ProductSort::Default,
        );
    }

    public function perPage(): int
    {
        return $this->integer('per_page', self::DEFAULT_PER_PAGE);
    }
}
