<?php

declare(strict_types=1);

use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Post;

it('publishes only posts whose date has arrived', function (): void {
    $published = Post::factory()->create();
    Post::factory()->draft()->create();
    Post::factory()->scheduled()->create();

    expect(Post::query()->published()->pluck('id')->all())->toBe([$published->id]);
});

it('filters by category slug and tag slug', function (): void {
    $food = BlogCategory::factory()->create(['slug' => 'food']);
    $travel = BlogTag::factory()->create(['slug' => 'travel']);

    $foodPost = Post::factory()->hasAttached($food, [], 'categories')->create();
    $travelPost = Post::factory()->hasAttached($travel, [], 'tags')->create();
    Post::factory()->create();

    expect(Post::query()->inCategory('food')->pluck('id')->all())->toBe([$foodPost->id])
        ->and(Post::query()->withTag('travel')->pluck('id')->all())->toBe([$travelPost->id])
        ->and(Post::query()->inCategory(null)->withTag('')->count())->toBe(3);
});

it('searches the title and the excerpt case-insensitively', function (): void {
    $byTitle = Post::factory()->create(['title' => 'The Night Sky', 'excerpt' => 'Stars.']);
    $byExcerpt = Post::factory()->create(['title' => 'Telescopes 101', 'excerpt' => 'Looking at the night.']);
    Post::factory()->create(['title' => 'Eating Well', 'excerpt' => 'Food on the road.']);

    expect(Post::query()->search('NIGHT')->pluck('id')->sort()->values()->all())->toBe([$byTitle->id, $byExcerpt->id])
        ->and(Post::query()->search('   ')->count())->toBe(3);
});

it('orders newest first with the id as a tie-breaker', function (): void {
    $sameDay = now()->subDays(2);
    $older = Post::factory()->create(['published_at' => $sameDay]);
    $olderButCreatedLater = Post::factory()->create(['published_at' => $sameDay]);
    $newest = Post::factory()->create(['published_at' => now()->subDay()]);

    expect(Post::query()->newestFirst()->pluck('id')->all())
        ->toBe([$newest->id, $olderButCreatedLater->id, $older->id]);
});
