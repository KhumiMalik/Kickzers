<?php

declare(strict_types=1);

use App\Models\Comment;
use App\Models\Post;
use App\Models\Product;

it('lists a product\'s approved threads oldest first with their approved replies', function (): void {
    $product = Product::factory()->create();
    $later = Comment::factory()->create(['commentable_id' => $product->id, 'created_at' => now()->subHour()]);
    $first = Comment::factory()->create(['commentable_id' => $product->id, 'created_at' => now()->subDay()]);
    $secondReply = Comment::factory()->replyTo($first)->create(['created_at' => now()->subMinutes(10)]);
    $firstReply = Comment::factory()->replyTo($first)->create(['created_at' => now()->subMinutes(20)]);
    Comment::factory()->replyTo($first)->unapproved()->create();
    Comment::factory()->unapproved()->create(['commentable_id' => $product->id]);
    Comment::factory()->create();

    $this->getJson(route('api.v1.products.comments.index', $product))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.0.replies.0.id', $firstReply->id)
        ->assertJsonPath('data.0.replies.1.id', $secondReply->id)
        ->assertJsonPath('data.0.replies.0.replies', [])
        ->assertJsonCount(2, 'data.0.replies')
        ->assertJsonPath('data.1.id', $later->id)
        ->assertJsonPath('data.1.replies', []);
});

it('lists a post\'s comments and never mixes in another owner\'s comments', function (): void {
    $post = Post::factory()->create();
    $comment = Comment::factory()->forPost($post)->create();
    Comment::factory()->forPost()->create();
    // Same numeric id, other type: a product comment must not appear on the post.
    Comment::factory()->create(['commentable_id' => Product::factory()->create(['id' => $post->id])->id]);

    $this->getJson(route('api.v1.posts.comments.index', $post))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $comment->id)
        ->assertJsonStructure(['data' => [['id', 'author_name', 'avatar', 'body', 'created_at', 'replies']], 'meta']);
});

it('pages 20 threads at a time', function (): void {
    $product = Product::factory()->create();
    Comment::factory()->count(21)->create(['commentable_id' => $product->id]);

    $this->getJson(route('api.v1.products.comments.index', $product))
        ->assertJsonCount(20, 'data')
        ->assertJsonPath('meta.last_page', 2);
});

it('is not found for drafts and unpublished posts', function (): void {
    $draft = Product::factory()->draft()->create();
    $scheduled = Post::factory()->scheduled()->create();

    $this->getJson(route('api.v1.products.comments.index', $draft->slug))->assertNotFound();
    $this->getJson(route('api.v1.posts.comments.index', $scheduled->slug))
        ->assertNotFound()
        ->assertExactJson(['message' => 'Post not found.']);
});

it('runs the same number of queries however many threads and replies there are', function (): void {
    $product = Product::factory()->create();
    Comment::factory()->replyTo(Comment::factory()->create(['commentable_id' => $product->id]))->create();
    $few = queryCount(fn () => $this->getJson(route('api.v1.products.comments.index', $product))->assertOk());

    Comment::factory()->count(8)->create(['commentable_id' => $product->id])
        ->each(fn (Comment $thread) => Comment::factory()->count(2)->replyTo($thread)->create());
    $many = queryCount(fn () => $this->getJson(route('api.v1.products.comments.index', $product))->assertOk());

    expect($many)->toBe($few);
});
