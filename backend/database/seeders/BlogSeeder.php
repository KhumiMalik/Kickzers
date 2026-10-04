<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Demo blog: the same authors, categories (three of them featured as cards
 * above the list), tags, 9 posts and comments the frontend mock server used.
 * Expects an empty blog (run through `migrate:fresh --seed`).
 */
final class BlogSeeder extends Seeder
{
    /** @var array<string, string> slug => name */
    private const array CATEGORIES = [
        'technology' => 'Technology',
        'lifestyle' => 'Lifestyle',
        'fashion' => 'Fashion',
        'art' => 'Art',
        'food' => 'Food',
        'architecture' => 'Architecture',
        'adventure' => 'Adventure',
    ];

    /**
     * The three cards above the blog list, in display order.
     *
     * @var array<string, array{title: string, tagline: string, image: string}> category slug => card
     */
    private const array FEATURED_CATEGORIES = [
        'lifestyle' => ['title' => 'Social Life', 'tagline' => 'Enjoy your social life together', 'image' => 'blog/cat-post/cat-post-3.jpg'],
        'technology' => ['title' => 'Politics', 'tagline' => 'Be a part of politics', 'image' => 'blog/cat-post/cat-post-2.jpg'],
        'food' => ['title' => 'Food', 'tagline' => 'Let the food be finished', 'image' => 'blog/cat-post/cat-post-1.jpg'],
    ];

    /** @var array<string, string> slug => name */
    private const array TAGS = [
        'technology' => 'Technology',
        'lifestyle' => 'Lifestyle',
        'adventure' => 'Adventure',
        'art' => 'Art',
        'architecture' => 'Architecture',
        'fashion' => 'Fashion',
        'food' => 'Food',
    ];

    private const string EXCERPT = 'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction.';

    private const string PARAGRAPH = 'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.';

    private const string QUOTE = 'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower to actually sit through a self-imposed MCSE training.';

    private const string CLOSING_PARAGRAPH = 'MCSE boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get the MCSE study materials yourself at a fraction of the camp price. However, who has the willpower.';

    /**
     * Newest first.
     *
     * @var list<array{slug: string, title: string, image: string, thumbnail: string, published_at: string, views: int, categories: list<string>, tags: list<string>}>
     */
    private const array POSTS = [
        ['slug' => 'astronomy-binoculars-a-great-alternative', 'title' => 'Astronomy Binoculars A Great Alternative', 'image' => 'blog/main-blog/m-blog-1.jpg', 'thumbnail' => 'blog/popular-post/post1.jpg', 'published_at' => '2026-09-28 09:00:00', 'views' => 1200000, 'categories' => ['technology', 'lifestyle'], 'tags' => ['technology', 'lifestyle']],
        ['slug' => 'the-basics-of-buying-a-telescope', 'title' => 'The Basics Of Buying A Telescope', 'image' => 'blog/main-blog/m-blog-2.jpg', 'thumbnail' => 'blog/popular-post/post2.jpg', 'published_at' => '2026-09-21 09:00:00', 'views' => 870000, 'categories' => ['technology'], 'tags' => ['technology', 'adventure']],
        ['slug' => 'the-glossary-of-telescopes', 'title' => 'The Glossary Of Telescopes', 'image' => 'blog/main-blog/m-blog-3.jpg', 'thumbnail' => 'blog/popular-post/post3.jpg', 'published_at' => '2026-09-14 09:00:00', 'views' => 540000, 'categories' => ['technology', 'art'], 'tags' => ['art', 'technology']],
        ['slug' => 'the-night-sky', 'title' => 'The Night Sky', 'image' => 'blog/main-blog/m-blog-4.jpg', 'thumbnail' => 'blog/popular-post/post4.jpg', 'published_at' => '2026-09-07 09:00:00', 'views' => 1500000, 'categories' => ['adventure', 'lifestyle'], 'tags' => ['adventure', 'lifestyle']],
        ['slug' => 'telescopes-101', 'title' => 'Telescopes 101', 'image' => 'blog/main-blog/m-blog-5.jpg', 'thumbnail' => 'blog/popular-post/post1.jpg', 'published_at' => '2026-08-31 09:00:00', 'views' => 320000, 'categories' => ['technology'], 'tags' => ['technology']],
        ['slug' => 'space-the-final-frontier', 'title' => 'Space The Final Frontier', 'image' => 'blog/main-blog/m-blog-2.jpg', 'thumbnail' => 'blog/popular-post/post2.jpg', 'published_at' => '2026-08-24 09:00:00', 'views' => 990000, 'categories' => ['adventure'], 'tags' => ['adventure', 'architecture']],
        ['slug' => 'the-amazing-hubble', 'title' => 'The Amazing Hubble', 'image' => 'blog/main-blog/m-blog-3.jpg', 'thumbnail' => 'blog/popular-post/post3.jpg', 'published_at' => '2026-08-17 09:00:00', 'views' => 410000, 'categories' => ['architecture', 'art'], 'tags' => ['architecture', 'art']],
        ['slug' => 'street-style-for-the-new-season', 'title' => 'Street Style For The New Season', 'image' => 'blog/main-blog/m-blog-4.jpg', 'thumbnail' => 'blog/popular-post/post4.jpg', 'published_at' => '2026-08-10 09:00:00', 'views' => 760000, 'categories' => ['fashion', 'lifestyle'], 'tags' => ['fashion', 'lifestyle']],
        ['slug' => 'eating-well-on-the-road', 'title' => 'Eating Well On The Road', 'image' => 'blog/main-blog/m-blog-1.jpg', 'thumbnail' => 'blog/popular-post/post1.jpg', 'published_at' => '2026-08-03 09:00:00', 'views' => 280000, 'categories' => ['food', 'adventure'], 'tags' => ['food', 'adventure']],
    ];

    private const string COMMENT = 'Never say goodbye till the end comes!';

    public function run(): void
    {
        // The sidebar "about the author" widget shows the featured author.
        BlogAuthor::query()->create([
            'name' => 'Charlie Barber',
            'role' => 'Senior blog writer',
            'avatar_path' => 'blog/author.png',
            'bio' => 'Boot camps have its supporters and its detractors. Some people do not understand why you should have to spend money on boot camp when you can get. Boot camps have its supporters and its detractors.',
            'is_featured' => true,
        ]);

        $postAuthor = BlogAuthor::query()->create(['name' => 'Mark Wiens']);

        $categoryIds = [];
        foreach (self::CATEGORIES as $slug => $name) {
            $card = self::FEATURED_CATEGORIES[$slug] ?? null;
            $position = array_search($slug, array_keys(self::FEATURED_CATEGORIES), true);

            $categoryIds[$slug] = BlogCategory::query()->create([
                'slug' => $slug,
                'name' => $name,
                'featured_title' => $card['title'] ?? null,
                'featured_tagline' => $card['tagline'] ?? null,
                'featured_image_path' => $card['image'] ?? null,
                'featured_position' => $position === false ? null : $position + 1,
            ])->id;
        }

        $tagIds = [];
        foreach (self::TAGS as $slug => $name) {
            $tagIds[$slug] = BlogTag::query()->create(['slug' => $slug, 'name' => $name])->id;
        }

        foreach (self::POSTS as $data) {
            $post = Post::query()->create([
                'blog_author_id' => $postAuthor->id,
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => self::EXCERPT,
                'body' => self::PARAGRAPH."\n\n".self::PARAGRAPH,
                'quote' => self::QUOTE,
                'closing' => self::CLOSING_PARAGRAPH."\n\n".self::CLOSING_PARAGRAPH,
                'image_path' => $data['image'],
                'thumbnail_path' => $data['thumbnail'],
                'cover_path' => 'blog/feature-img1.jpg',
                'gallery' => ['blog/post-img1.jpg', 'blog/post-img2.jpg'],
                'views_count' => $data['views'],
                'published_at' => Carbon::parse($data['published_at'], 'UTC'),
            ]);

            $post->categories()->attach(array_map(fn (string $slug): int => $categoryIds[$slug], $data['categories']));
            $post->tags()->attach(array_map(fn (string $slug): int => $tagIds[$slug], $data['tags']));

            $this->seedComments($post);
        }
    }

    /** Five comments per post; Emilly's thread has two replies. */
    private function seedComments(Post $post): void
    {
        $thread = $this->comment($post, null, 'Emilly Blunt', 'blog/c1.jpg', '2026-09-04 15:12:00');
        $this->comment($post, $thread, 'Elsie Cunningham', 'blog/c2.jpg', '2026-09-04 15:40:00');
        $this->comment($post, $thread, 'Annie Stephens', 'blog/c3.jpg', '2026-09-04 16:02:00');
        $this->comment($post, null, 'Maria Luna', 'blog/c4.jpg', '2026-09-05 09:30:00');
        $this->comment($post, null, 'Ina Hayes', 'blog/c5.jpg', '2026-09-06 11:45:00');
    }

    private function comment(Post $post, ?Comment $parent, string $name, string $avatar, string $at): Comment
    {
        $comment = $post->comments()->make([
            'parent_id' => $parent?->id,
            'author_name' => $name,
            'author_email' => str_replace(' ', '.', strtolower($name)).'@example.com',
            'avatar_path' => $avatar,
            'body' => self::COMMENT,
        ]);
        $comment->setCreatedAt($at)->setUpdatedAt($at)->save();

        return $comment;
    }
}
