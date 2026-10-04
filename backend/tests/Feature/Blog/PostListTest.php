<?php

declare(strict_types=1);

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Comment;
use App\Models\Post;

it('lists published posts newest first, five per page', function (): void {
    Post::factory()->count(6)->sequence(fn ($sequence) => ['published_at' => now()->subDays($sequence->index + 1)])->create();
    Post::factory()->draft()->create();
    Post::factory()->scheduled()->create();

    $response = $this->getJson(route('api.v1.posts.index'))
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('meta.total', 6)
        ->assertJsonStructure(['data' => [[
            'id', 'slug', 'title', 'excerpt', 'image', 'thumbnail', 'author' => ['name'], 'published_at', 'views',
            'comments_count', 'categories', 'tags',
        ]]]);

    $dates = $response->json('data.*.published_at');
    expect($dates)->toBe(collect($dates)->sortDesc()->values()->all());
});

it('filters by category slug, tag slug and search text', function (): void {
    $food = BlogCategory::factory()->create(['slug' => 'food', 'name' => 'Food']);
    $travel = BlogTag::factory()->create(['slug' => 'travel', 'name' => 'Travel']);
    $match = Post::factory()->hasAttached($food, [], 'categories')->hasAttached($travel, [], 'tags')->create(['title' => 'Eating Well On The Road']);
    Post::factory()->hasAttached($food, [], 'categories')->create(['title' => 'Eating At Home']);
    Post::factory()->create(['title' => 'Eating Well Elsewhere']);

    $this->getJson(route('api.v1.posts.index', ['category' => 'food', 'tag' => 'travel', 'q' => 'well']))
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $match->id)
        ->assertJsonPath('data.0.categories', [['slug' => 'food', 'name' => 'Food']])
        ->assertJsonPath('data.0.tags', [['slug' => 'travel', 'name' => 'Travel']]);
});

it('counts only approved comments, replies included', function (): void {
    $post = Post::factory()->create();
    Comment::factory()->replyTo(Comment::factory()->forPost($post)->create())->create();
    Comment::factory()->forPost($post)->unapproved()->create();

    $this->getJson(route('api.v1.posts.index'))->assertJsonPath('data.0.comments_count', 2);
});

it('rejects a page size above 20', function (): void {
    $this->getJson(route('api.v1.posts.index', ['per_page' => 21]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['per_page']);
});

it('runs the same number of queries however many posts are listed', function (): void {
    Post::factory()->hasAttached(BlogCategory::factory(), [], 'categories')->create();
    $few = queryCount(fn () => $this->getJson(route('api.v1.posts.index'))->assertOk());

    Post::factory()->count(4)->hasAttached(BlogTag::factory()->count(2), [], 'tags')->create();
    $many = queryCount(fn () => $this->getJson(route('api.v1.posts.index'))->assertOk());

    expect($many)->toBe($few);
});
