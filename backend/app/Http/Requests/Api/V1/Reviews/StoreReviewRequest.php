<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Reviews;

use App\Http\Requests\Api\V1\Concerns\IdentifiesAuthor;
use Illuminate\Foundation\Http\FormRequest;

/** `POST /products/{slug}/reviews` (contract §6). */
final class StoreReviewRequest extends FormRequest
{
    use IdentifiesAuthor;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...$this->authorRules(),
            'rating' => ['required', 'integer', 'between:1,5'],
            'body' => ['required', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rating.required' => 'Please choose a rating from 1 to 5.',
            'rating.integer' => 'Please choose a rating from 1 to 5.',
            'rating.between' => 'Please choose a rating from 1 to 5.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['body' => 'review'];
    }

    public function rating(): int
    {
        return $this->integer('rating');
    }

    public function body(): string
    {
        return $this->string('body')->trim()->toString();
    }

    protected function prepareForValidation(): void
    {
        $this->fillAuthorFromAccount();
    }
}
