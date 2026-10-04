<?php

declare(strict_types=1);

use App\Models\Post;
use Database\Seeders\BlogSeeder;

it('returns the seeded post page with paragraphs, gallery and neighbours', function (): void {
    $this->seed(BlogSeeder::class);

    $response = $this->getJson(route('api.v1.posts.show', 'the-night-sky'))->assertOk();

    $response
        ->assertJsonPath('data.title', 'The Night Sky')
        ->assertJsonPath('data.author', ['name' => 'Mark Wiens'])
        ->assertJsonCount(2, 'data.body')
        ->assertJsonCount(2, 'data.closing')
        ->assertJsonCount(2, 'data.gallery')
        ->assertJsonPath('data.comments_count', 5)
        ->assertJsonPath('data.previous.slug', 'telescopes-101')
        ->assertJsonPath('data.next.slug', 'the-glossary-of-telescopes');

    expect($response->json('data.cover'))->toEndWith('/storage/blog/feature-img1.jpg')
        ->and($response->json('data.gallery.1'))->toEndWith('/storage/blog/post-img2.jpg');
});

it('has no previous post at the oldest end and no next post at the newest end', function (): void {
    $oldest = Post::factory()->create(['published_at' => now()->subDays(2)]);
    $newest = Post::factory()->create(['published_at' => now()->subDay()]);

    $this->getJson(route('api.v1.posts.show', $oldest))->assertJsonPath('data.previous', null)->assertJsonPath('data.next.slug', $newest->slug);
    $this->getJson(route('api.v1.posts.show', $newest))->assertJsonPath('data.next', null)->assertJsonPath('data.previous.slug', $oldest->slug);
});

it('links neighbours past scheduled posts and in a stable order for equal dates', function (): void {
    $sameTime = now()->subDay()->startOfSecond();
    $first = Post::factory()->create(['published_at' => $sameTime]);
    $second = Post::factory()->create(['published_at' => $sameTime]);
    Post::factory()->scheduled()->create();

    $this->getJson(route('api.v1.posts.show', $first))->assertJsonPath('data.next.slug', $second->slug);
    $this->getJson(route('api.v1.posts.show', $second))
        ->assertJsonPath('data.previous.slug', $first->slug)
        ->assertJsonPath('data.next', null);
});

it('counts a view after responding and shows the count from before the view', function (): void {
    $post = Post::factory()->create(['views_count' => 41]);

    $this->getJson(route('api.v1.posts.show', $post))->assertJsonPath('data.views', 41);

    expect($post->refresh()->views_count)->toBe(42);
});

it('does not reveal drafts or scheduled posts', function (): void {
    $draft = Post::factory()->draft()->create();
    $scheduled = Post::factory()->scheduled()->create();

    $this->getJson(route('api.v1.posts.show', $draft->slug))->assertNotFound()->assertExactJson(['message' => 'Post not found.']);
    $this->getJson(route('api.v1.posts.show', $scheduled->slug))->assertNotFound();
});
