<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BlogAuthor;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Post>
 */
final class PostFactory extends Factory
{
    /**
     * A post published yesterday.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(rtrim(fake()->unique()->sentence(4, false), '.'));

        return [
            'blog_author_id' => BlogAuthor::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => fake()->sentence(20),
            'body' => fake()->paragraph()."\n\n".fake()->paragraph(),
            'quote' => fake()->sentence(25),
            'closing' => fake()->paragraph()."\n\n".fake()->paragraph(),
            'image_path' => 'blog/m-blog-1.jpg',
            'thumbnail_path' => 'blog/post1.jpg',
            'cover_path' => 'blog/feature-img1.jpg',
            'gallery' => ['blog/post-img1.jpg', 'blog/post-img2.jpg'],
            'views_count' => fake()->numberBetween(0, 100_000),
            'published_at' => now()->subDay(),
        ];
    }

    /** Not published (no date). */
    public function draft(): static
    {
        return $this->state(fn (): array => ['published_at' => null]);
    }

    /** Publication date in the future. */
    public function scheduled(): static
    {
        return $this->state(fn (): array => ['published_at' => now()->addWeek()]);
    }
}
