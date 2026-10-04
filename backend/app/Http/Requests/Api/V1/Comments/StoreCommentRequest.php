<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Comments;

use App\Http\Requests\Api\V1\Concerns\IdentifiesAuthor;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use LogicException;

/**
 * `POST /products/{slug}/comments` and `POST /posts/{slug}/comments`
 * (contract §6). A reply must answer a published top-level comment of the
 * same product or post: replies are one level deep, like the template.
 */
final class StoreCommentRequest extends FormRequest
{
    use IdentifiesAuthor;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $commentable = $this->commentable();

        return [
            ...$this->authorRules(),
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('comments', 'id')
                    ->where('commentable_type', $commentable->getMorphClass())
                    ->where('commentable_id', $commentable->getKey())
                    ->whereNull('parent_id')
                    ->where('is_approved', true),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'parent_id.integer' => 'You can only reply to a top-level comment on this page.',
            'parent_id.exists' => 'You can only reply to a top-level comment on this page.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['body' => 'message'];
    }

    /** The product or post from the URL ({product} / {post} route binding). */
    public function commentable(): Product|Post
    {
        $commentable = $this->route('product') ?? $this->route('post');

        return $commentable instanceof Product || $commentable instanceof Post
            ? $commentable
            : throw new LogicException('Comment routes must bind {product} or {post}.');
    }

    public function body(): string
    {
        return $this->string('body')->trim()->toString();
    }

    public function subject(): ?string
    {
        return $this->string('subject')->trim()->toString() ?: null;
    }

    public function parentId(): ?int
    {
        return $this->filled('parent_id') ? $this->integer('parent_id') : null;
    }

    protected function prepareForValidation(): void
    {
        $this->fillAuthorFromAccount();
    }
}
