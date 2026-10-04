<?php

declare(strict_types=1);

use App\Models\Comment;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;

it('publishes a product comment and a reply to it', function (): void {
    $product = Product::factory()->create();

    $thread = $this->postJson(route('api.v1.products.comments.store', $product), [
        'name' => 'Sam Patel', 'email' => 'sam@example.com', 'phone' => '555-0101', 'body' => 'Do they run small?',
    ])
        ->assertCreated()
        ->assertJsonPath('data.author_name', 'Sam Patel')
        ->assertJsonPath('data.replies', [])
        ->assertJsonMissingPath('data.email')
        ->json('data.id');

    $this->postJson(route('api.v1.products.comments.store', $product), [
        'name' => 'Kickzers Support', 'email' => 'support@example.com', 'body' => 'True to size.', 'parent_id' => $thread,
    ])->assertCreated();

    $this->getJson(route('api.v1.products.comments.index', $product))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.replies.0.body', 'True to size.');

    expect(Comment::query()->where('author_name', 'Sam Patel')->sole()->author_phone)->toBe('555-0101');
});

it('publishes a blog comment with a subject', function (): void {
    $post = Post::factory()->create();

    $this->postJson(route('api.v1.posts.comments.store', $post), [
        'name' => 'Emilly Blunt', 'email' => 'emilly@example.com', 'subject' => 'Lovely', 'body' => 'Never say goodbye till the end comes!',
    ])->assertCreated();

    expect(Comment::query()->sole())
        ->commentable_type->toBe('post')
        ->subject->toBe('Lovely');
});

it('fills name and e-mail from the account of a logged-in customer', function (): void {
    $user = User::factory()->create(['name' => 'Jane Doe']);

    $this->actingAs($user)
        ->postJson(route('api.v1.posts.comments.store', Post::factory()->create()), ['body' => 'Thanks!'])
        ->assertCreated()
        ->assertJsonPath('data.author_name', 'Jane Doe');

    expect(Comment::query()->sole()->user_id)->toBe($user->id);
});

it('only lets you reply to a published top-level comment on the same page', function (Closure $makeParent): void {
    $product = Product::factory()->create();
    $parent = $makeParent($product);

    $this->postJson(route('api.v1.products.comments.store', $product), [
        'name' => 'Sam', 'email' => 'sam@example.com', 'body' => 'Reply', 'parent_id' => $parent->id,
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['parent_id' => 'You can only reply to a top-level comment on this page.']);
})->with([
    'a reply (two levels deep)' => [fn (Product $product) => Comment::factory()->replyTo(Comment::factory()->create(['commentable_id' => $product->id]))->create()],
    'another product\'s comment' => [fn (Product $product) => Comment::factory()->create()],
    'a blog comment with the same owner id' => [fn (Product $product) => Comment::factory()->forPost(Post::factory()->create(['id' => $product->id]))->create()],
    'an unpublished comment' => [fn (Product $product) => Comment::factory()->unapproved()->create(['commentable_id' => $product->id])],
]);

it('requires a name, an e-mail and a message', function (): void {
    $this->postJson(route('api.v1.posts.comments.store', Post::factory()->create()), ['body' => str_repeat('a', 2001)])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'body']);
});

it('is not found for a scheduled post', function (): void {
    $scheduled = Post::factory()->scheduled()->create();

    $this->postJson(route('api.v1.posts.comments.store', $scheduled->slug), ['name' => 'A', 'email' => 'a@example.com', 'body' => 'x'])
        ->assertNotFound();
});
