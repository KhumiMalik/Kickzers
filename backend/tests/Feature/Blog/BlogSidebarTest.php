<?php

declare(strict_types=1);

use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\Post;
use Database\Seeders\BlogSeeder;

it('returns the seeded sidebar widgets and featured cards', function (): void {
    $this->seed(BlogSeeder::class);

    $response = $this->getJson(route('api.v1.blog.sidebar'))->assertOk();

    $response
        ->assertJsonPath('data.author.name', 'Charlie Barber')
        ->assertJsonPath('data.author.role', 'Senior blog writer')
        ->assertJsonCount(4, 'data.popular')
        ->assertJsonPath('data.popular.0.slug', 'the-night-sky')
        ->assertJsonPath('data.categories.0', ['slug' => 'technology', 'name' => 'Technology', 'posts_count' => 4])
        ->assertJsonCount(7, 'data.tags')
        ->assertJsonPath('data.featured_categories.*.name', ['Social Life', 'Politics', 'Food'])
        ->assertJsonPath('data.featured_categories.0.slug', 'lifestyle')
        ->assertJsonPath('data.featured_categories.0.tagline', 'Enjoy your social life together');

    expect($response->json('data.author.avatar'))->toEndWith('/storage/blog/author.png');
});

it('counts and ranks only published posts', function (): void {
    $category = BlogCategory::factory()->create();
    Post::factory()->hasAttached($category, [], 'categories')->create(['views_count' => 10]);
    Post::factory()->draft()->hasAttached($category, [], 'categories')->create(['views_count' => 1_000]);
    Post::factory()->scheduled()->create(['views_count' => 2_000]);

    $this->getJson(route('api.v1.blog.sidebar'))
        ->assertJsonCount(1, 'data.popular')
        ->assertJsonPath('data.categories.0.posts_count', 1);
});

it('returns a null author when none is featured', function (): void {
    BlogAuthor::factory()->create();

    $this->getJson(route('api.v1.blog.sidebar'))->assertOk()->assertJsonPath('data.author', null);
});
