<?php

declare(strict_types=1);

use App\Enums\PromotionType;
use App\Models\Banner;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Review;

it('finds only the promotions of a type that are running right now', function (): void {
    $running = Promotion::factory()->create();
    Promotion::factory()->expired()->create();
    Promotion::factory()->upcoming()->create();
    Promotion::factory()->exclusiveDeal()->create();

    expect(Promotion::query()->running(PromotionType::DealsOfTheWeek)->pluck('id')->all())->toBe([$running->id]);
});

it('keeps promotion products in their pivot position order', function (): void {
    [$first, $second] = Product::factory()->count(2)->create();
    $promotion = Promotion::factory()->create();
    $promotion->products()->attach([$second->id => ['position' => 1], $first->id => ['position' => 0]]);

    expect($promotion->products()->pluck('products.id')->all())->toBe([$first->id, $second->id]);
});

it('lists only active banners', function (): void {
    $active = Banner::factory()->create();
    Banner::factory()->inactive()->create();

    expect(Banner::query()->active()->pluck('id')->all())->toBe([$active->id]);
});

it('lists only approved reviews and hides the author contact details', function (): void {
    $approved = Review::factory()->create(['author_phone' => '555-0100']);
    Review::factory()->unapproved()->create();

    expect(Review::query()->approved()->pluck('id')->all())->toBe([$approved->id])
        ->and($approved->toArray())->not->toHaveKeys(['author_email', 'author_phone']);
});

it('lists approved top-level comments with their replies', function (): void {
    $post = Post::factory()->create();
    $thread = Comment::factory()->forPost($post)->create();
    $reply = Comment::factory()->forPost($post)->replyTo($thread)->create();
    Comment::factory()->forPost($post)->unapproved()->create();

    expect(Comment::query()->approved()->topLevel()->pluck('id')->all())->toBe([$thread->id])
        ->and($thread->replies()->pluck('id')->all())->toBe([$reply->id]);
});

it('stores comment owners with the morph map alias, not the class name', function (): void {
    $productComment = Comment::factory()->create(['commentable_type' => 'product', 'commentable_id' => Product::factory()->create()->id]);
    $postComment = Comment::factory()->forPost()->create();

    expect($productComment->getRawOriginal('commentable_type'))->toBe('product')
        ->and($postComment->getRawOriginal('commentable_type'))->toBe('post')
        ->and($productComment->commentable)->toBeInstanceOf(Product::class)
        ->and($postComment->commentable)->toBeInstanceOf(Post::class);
});
