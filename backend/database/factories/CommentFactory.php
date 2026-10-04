<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
final class CommentFactory extends Factory
{
    /**
     * A top-level comment on a product.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'commentable_type' => 'product',
            'commentable_id' => Product::factory(),
            'parent_id' => null,
            'user_id' => null,
            'author_name' => fake()->name(),
            'author_email' => fake()->safeEmail(),
            'author_phone' => null,
            'subject' => null,
            'avatar_path' => null,
            'body' => fake()->sentence(12),
            'is_approved' => true,
        ];
    }

    public function forPost(?Post $post = null): static
    {
        return $this->state(fn (): array => [
            'commentable_type' => 'post',
            'commentable_id' => $post === null ? Post::factory() : $post->id,
        ]);
    }

    /** A reply in `$parent`'s thread (same product or post). */
    public function replyTo(Comment $parent): static
    {
        return $this->state(fn (): array => [
            'commentable_type' => $parent->commentable_type,
            'commentable_id' => $parent->commentable_id,
            'parent_id' => $parent->id,
        ]);
    }

    public function unapproved(): static
    {
        return $this->state(fn (): array => ['is_approved' => false]);
    }
}
