<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A product review (1–5 stars). The author's email and phone are never exposed. */
#[Fillable([
    'product_id', 'user_id', 'author_name', 'author_email', 'author_phone', 'avatar_path', 'rating', 'body', 'is_approved',
])]
#[Hidden(['author_email', 'author_phone'])]
final class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param  Builder<self>  $query */
    #[Scope]
    protected function approved(Builder $query): void
    {
        $query->where('is_approved', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['rating' => 'integer', 'is_approved' => 'boolean'];
    }
}
