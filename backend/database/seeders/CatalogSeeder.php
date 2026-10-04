<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Enums\PromotionType;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Color;
use App\Models\Comment;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Demo catalog: the same categories, brands, colours, 18 products, banners,
 * promotions, reviews and product comments the frontend mock server used.
 * Expects an empty catalog (run through `migrate:fresh --seed`).
 *
 * Rows are linked by slug rather than by id so nothing depends on
 * auto-increment values.
 */
final class CatalogSeeder extends Seeder
{
    /** @var list<array{slug: string, name: string, parent: string|null}> */
    private const array CATEGORIES = [
        ['slug' => 'men-shoes', 'name' => "Men's Shoes", 'parent' => null],
        ['slug' => 'running', 'name' => 'Running', 'parent' => 'men-shoes'],
        ['slug' => 'sneakers', 'name' => 'Sneakers', 'parent' => 'men-shoes'],
        ['slug' => 'casual', 'name' => 'Casual', 'parent' => 'men-shoes'],
        ['slug' => 'basketball', 'name' => 'Basketball', 'parent' => 'men-shoes'],
        ['slug' => 'women-shoes', 'name' => "Women's Shoes", 'parent' => null],
        ['slug' => 'women-sneakers', 'name' => 'Sneakers', 'parent' => 'women-shoes'],
        ['slug' => 'canvas', 'name' => 'Canvas', 'parent' => 'women-shoes'],
        ['slug' => 'men-clothing', 'name' => "Men's Clothing", 'parent' => null],
        ['slug' => 'sweatshirts', 'name' => 'Sweatshirts', 'parent' => 'men-clothing'],
        ['slug' => 'jerseys', 'name' => 'Jerseys', 'parent' => 'men-clothing'],
        ['slug' => 'training-tops', 'name' => 'Training Tops', 'parent' => 'men-clothing'],
        ['slug' => 'women-clothing', 'name' => "Women's Clothing", 'parent' => null],
        ['slug' => 'dresses', 'name' => 'Dresses', 'parent' => 'women-clothing'],
        ['slug' => 'shirts', 'name' => 'Shirts', 'parent' => 'women-clothing'],
        ['slug' => 'accessories', 'name' => 'Accessories', 'parent' => null],
    ];

    /** @var array<string, string> slug => name */
    private const array BRANDS = [
        'adidas' => 'Adidas',
        'nike' => 'Nike',
        'puma' => 'Puma',
        'new-balance' => 'New Balance',
        'asics' => 'Asics',
        'converse' => 'Converse',
        'karma' => 'Karma Basics',
    ];

    /** @var array<string, string> slug => name */
    private const array COLORS = [
        'black' => 'Black',
        'grey' => 'Grey',
        'spacegrey' => 'Spacegrey',
        'gold' => 'Gold',
        'red' => 'Red',
        'orange' => 'Orange',
        'blue' => 'Blue',
        'pink' => 'Pink',
    ];

    /** Categories whose products get the apparel specification table instead of the shoe one. */
    private const array APPAREL_CATEGORIES = ['sweatshirts', 'jerseys', 'training-tops', 'dresses', 'shirts'];

    /** @var list<array{string, string}> */
    private const array SHOE_SPECIFICATIONS = [
        ['Upper', 'Engineered mesh'],
        ['Outsole', 'Rubber'],
        ['Closure', 'Lace-up'],
        ['Weight', '290gm'],
        ['Quality checking', 'yes'],
        ['Each Box contains', '1 pair'],
    ];

    /** @var list<array{string, string}> */
    private const array APPAREL_SPECIFICATIONS = [
        ['Material', '100% Cotton'],
        ['Fit', 'Regular'],
        ['Care', 'Machine wash cold'],
        ['Weight', '220gm'],
        ['Quality checking', 'yes'],
        ['Each Box contains', '1pc'],
    ];

    private const string SHORT_DESCRIPTION = 'Built for everyday comfort with modern materials and a clean silhouette. If you are looking for something that makes your outfit look awesome and feels great all day long, this is it.';

    /** Paragraphs separated by a blank line. */
    private const string DESCRIPTION = "Beryl Cook is one of Britain’s most talented and amusing artists. Beryl’s pictures feature women of all shapes and sizes enjoying themselves. Born between the two world wars, Beryl Cook eventually left Kendrick School in Reading at the age of 15, where she went to secretarial school and then into an insurance office.\n\nIt is often frustrating to attempt to plan meals that are designed for one. Despite this fact, we are seeing more and more recipe books and Internet websites that are dedicated to the act of cooking for one. Divorce and the death of spouses or grown children leaving for college are all reasons that someone accustomed to cooking for more than one would suddenly need to learn how to adjust.";

    /**
     * The 18 products in display order. Prices in cents.
     *
     * @var list<array{slug: string, name: string, price: int, compare_at_price: int|null, image: string, category: string, brand: string, color: string, published_at: string, coming_soon?: bool}>
     */
    private const array PRODUCTS = [
        ['slug' => 'aero-knit-running-shoe', 'name' => 'Aero Knit Running Shoe', 'price' => 15000, 'compare_at_price' => 21000, 'image' => 'product/p1.jpg', 'category' => 'running', 'brand' => 'adidas', 'color' => 'grey', 'published_at' => '2026-09-20 09:00:00'],
        ['slug' => 'volt-free-trainer', 'name' => 'Volt Free Trainer', 'price' => 12900, 'compare_at_price' => 16000, 'image' => 'product/p2.jpg', 'category' => 'running', 'brand' => 'nike', 'color' => 'spacegrey', 'published_at' => '2026-09-18 09:00:00'],
        ['slug' => 'perforated-leather-slip-on', 'name' => 'Perforated Leather Slip-On', 'price' => 8900, 'compare_at_price' => null, 'image' => 'product/p3.jpg', 'category' => 'casual', 'brand' => 'karma', 'color' => 'black', 'published_at' => '2026-09-15 09:00:00'],
        ['slug' => 'retro-574-suede-runner', 'name' => 'Retro 574 Suede Runner', 'price' => 11000, 'compare_at_price' => 13500, 'image' => 'product/p4.jpg', 'category' => 'sneakers', 'brand' => 'new-balance', 'color' => 'gold', 'published_at' => '2026-09-12 09:00:00'],
        ['slug' => 'suede-classic-low', 'name' => 'Suede Classic Low', 'price' => 7500, 'compare_at_price' => 9500, 'image' => 'product/p5.jpg', 'category' => 'women-sneakers', 'brand' => 'puma', 'color' => 'grey', 'published_at' => '2026-09-10 09:00:00'],
        ['slug' => 'gel-blaze-running-shoe', 'name' => 'Gel Blaze Running Shoe', 'price' => 14000, 'compare_at_price' => 18000, 'image' => 'product/p6.jpg', 'category' => 'running', 'brand' => 'asics', 'color' => 'orange', 'published_at' => '2026-09-08 09:00:00'],
        ['slug' => 'suede-heritage-sneaker', 'name' => 'Suede Heritage Sneaker', 'price' => 8000, 'compare_at_price' => null, 'image' => 'product/p7.jpg', 'category' => 'sneakers', 'brand' => 'puma', 'color' => 'spacegrey', 'published_at' => '2026-09-05 09:00:00'],
        ['slug' => 'suede-pastel-low', 'name' => 'Suede Pastel Low', 'price' => 8500, 'compare_at_price' => 10000, 'image' => 'product/p8.jpg', 'category' => 'women-sneakers', 'brand' => 'puma', 'color' => 'pink', 'published_at' => '2026-09-02 09:00:00'],
        ['slug' => 'classic-crew-sweatshirt', 'name' => 'Classic Crew Sweatshirt', 'price' => 5500, 'compare_at_price' => 7000, 'image' => 'l1.jpg', 'category' => 'sweatshirts', 'brand' => 'adidas', 'color' => 'grey', 'published_at' => '2026-08-28 09:00:00'],
        ['slug' => 'camo-compression-tee', 'name' => 'Camo Compression Tee', 'price' => 4500, 'compare_at_price' => null, 'image' => 'l2.jpg', 'category' => 'training-tops', 'brand' => 'adidas', 'color' => 'grey', 'published_at' => '2026-08-25 09:00:00'],
        ['slug' => 'away-football-jersey', 'name' => 'Away Football Jersey', 'price' => 9000, 'compare_at_price' => 11000, 'image' => 'l3.jpg', 'category' => 'jerseys', 'brand' => 'adidas', 'color' => 'black', 'published_at' => '2026-08-20 09:00:00'],
        ['slug' => 'red-training-jersey', 'name' => 'Red Training Jersey', 'price' => 6500, 'compare_at_price' => null, 'image' => 'l4.jpg', 'category' => 'jerseys', 'brand' => 'adidas', 'color' => 'red', 'published_at' => '2026-08-18 09:00:00'],
        ['slug' => 'teal-wrap-jumpsuit', 'name' => 'Teal Wrap Jumpsuit', 'price' => 7000, 'compare_at_price' => null, 'image' => 'l5.jpg', 'category' => 'dresses', 'brand' => 'karma', 'color' => 'blue', 'published_at' => '2026-10-01 09:00:00', 'coming_soon' => true],
        ['slug' => 'cami-midi-dress', 'name' => 'Cami Midi Dress', 'price' => 6000, 'compare_at_price' => null, 'image' => 'l6.jpg', 'category' => 'dresses', 'brand' => 'karma', 'color' => 'spacegrey', 'published_at' => '2026-10-01 09:00:00', 'coming_soon' => true],
        ['slug' => 'belted-sleeveless-dress', 'name' => 'Belted Sleeveless Dress', 'price' => 7500, 'compare_at_price' => null, 'image' => 'l7.jpg', 'category' => 'dresses', 'brand' => 'karma', 'color' => 'black', 'published_at' => '2026-10-01 09:00:00', 'coming_soon' => true],
        ['slug' => 'gingham-check-shirt', 'name' => 'Gingham Check Shirt', 'price' => 5000, 'compare_at_price' => null, 'image' => 'l8.jpg', 'category' => 'shirts', 'brand' => 'karma', 'color' => 'red', 'published_at' => '2026-10-01 09:00:00', 'coming_soon' => true],
        ['slug' => 'zoom-flight-basketball-shoe', 'name' => 'Zoom Flight Basketball Shoe', 'price' => 14999, 'compare_at_price' => 18999, 'image' => 'category/s-p1.jpg', 'category' => 'basketball', 'brand' => 'nike', 'color' => 'blue', 'published_at' => '2026-09-25 09:00:00'],
        ['slug' => 'comic-hi-top-canvas', 'name' => 'Comic Hi-Top Canvas', 'price' => 15000, 'compare_at_price' => 21000, 'image' => 'product/e-p1.png', 'category' => 'canvas', 'brand' => 'converse', 'color' => 'spacegrey', 'published_at' => '2026-09-22 09:00:00'],
    ];

    private const string LOREM = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo';

    /**
     * Three reviews per product (5, 4 and 3 stars, so every product averages 4.0 like the template).
     *
     * @var list<array{name: string, email: string, avatar: string, rating: int, at: string}>
     */
    private const array REVIEWS = [
        ['name' => 'Blake Ruiz', 'email' => 'blake.ruiz@example.com', 'avatar' => 'product/review-1.png', 'rating' => 5, 'at' => '2026-02-12 17:56:00'],
        ['name' => 'Ana Torres', 'email' => 'ana.torres@example.com', 'avatar' => 'product/review-2.png', 'rating' => 4, 'at' => '2026-03-02 10:20:00'],
        ['name' => 'Sam Patel', 'email' => 'sam.patel@example.com', 'avatar' => 'product/review-3.png', 'rating' => 3, 'at' => '2026-04-18 09:05:00'],
    ];

    /** @var array<string, int> slug => id */
    private array $categoryIds = [];

    /** @var array<string, int> slug => id */
    private array $brandIds = [];

    /** @var array<string, int> slug => id */
    private array $colorIds = [];

    /** @var array<string, Product> slug => product */
    private array $products = [];

    public function run(): void
    {
        $this->seedTaxonomies();
        $this->seedProducts();
        $this->seedBanners();
        $this->seedPromotions();
        $this->seedReviewsAndComments();
    }

    private function seedTaxonomies(): void
    {
        foreach (self::CATEGORIES as $position => $category) {
            $this->categoryIds[$category['slug']] = Category::query()->create([
                'parent_id' => $category['parent'] === null ? null : $this->categoryIds[$category['parent']],
                'name' => $category['name'],
                'slug' => $category['slug'],
                'position' => $position,
            ])->id;
        }

        foreach (self::BRANDS as $slug => $name) {
            $this->brandIds[$slug] = Brand::query()->create(['slug' => $slug, 'name' => $name])->id;
        }

        foreach (self::COLORS as $slug => $name) {
            $this->colorIds[$slug] = Color::query()->create(['slug' => $slug, 'name' => $name])->id;
        }
    }

    private function seedProducts(): void
    {
        foreach (self::PRODUCTS as $index => $data) {
            $number = $index + 1;
            $comingSoon = $data['coming_soon'] ?? false;

            $product = Product::query()->create([
                'category_id' => $this->categoryIds[$data['category']],
                'brand_id' => $this->brandIds[$data['brand']],
                'color_id' => $this->colorIds[$data['color']],
                'name' => $data['name'],
                'slug' => $data['slug'],
                'sku' => sprintf('KS-%04d', $number),
                'short_description' => self::SHORT_DESCRIPTION,
                'description' => self::DESCRIPTION,
                'price' => $data['price'],
                'compare_at_price' => $data['compare_at_price'],
                'stock_quantity' => $comingSoon ? 0 : 25,
                'status' => $comingSoon ? ProductStatus::ComingSoon : ProductStatus::Active,
                'position' => $number,
                'published_at' => Carbon::parse($data['published_at'], 'UTC'),
            ]);

            // The template shows the same photo three times in the product gallery.
            foreach (range(0, 2) as $position) {
                $product->images()->create(['path' => $data['image'], 'alt' => $data['name'], 'position' => $position]);
            }

            $specifications = in_array($data['category'], self::APPAREL_CATEGORIES, true)
                ? self::APPAREL_SPECIFICATIONS
                : self::SHOE_SPECIFICATIONS;

            foreach ($specifications as $position => [$label, $value]) {
                $product->specifications()->create(['label' => $label, 'value' => $value, 'position' => $position]);
            }

            $this->products[$data['slug']] = $product;
        }
    }

    private function seedBanners(): void
    {
        foreach (['zoom-flight-basketball-shoe', 'volt-free-trainer'] as $position => $slug) {
            Banner::query()->create([
                'product_id' => $this->products[$slug]->id,
                'title_line_1' => 'Nike New',
                'title_line_2' => 'Collection!',
                'body' => 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
                'image_path' => 'banner/banner-img.png',
                'position' => $position,
                'is_active' => true,
            ]);
        }
    }

    /**
     * Dates are relative to the day of seeding (not fixed like the mock data's
     * 2026-12-31) so a freshly seeded demo always has running deals with a countdown.
     */
    private function seedPromotions(): void
    {
        $promotions = [
            [PromotionType::ExclusiveDeal, 'Exclusive Hot Deal Ends Soon!', ['zoom-flight-basketball-shoe', 'comic-hi-top-canvas']],
            [PromotionType::DealsOfTheWeek, 'Deals of the Week', [
                'aero-knit-running-shoe', 'volt-free-trainer', 'retro-574-suede-runner', 'suede-classic-low',
                'gel-blaze-running-shoe', 'suede-pastel-low', 'classic-crew-sweatshirt', 'away-football-jersey',
            ]],
        ];

        foreach ($promotions as [$type, $title, $slugs]) {
            $promotion = Promotion::query()->create([
                'type' => $type,
                'title' => $title,
                'starts_at' => now()->subDay()->startOfDay(),
                'ends_at' => now()->addDays(90)->endOfDay(),
            ]);

            foreach ($slugs as $position => $slug) {
                $promotion->products()->attach($this->products[$slug]->id, ['position' => $position]);
            }
        }
    }

    /** Per product: three reviews, and two comment threads where the first has a reply from support. */
    private function seedReviewsAndComments(): void
    {
        foreach ($this->products as $product) {
            foreach (self::REVIEWS as $review) {
                (new Review([
                    'product_id' => $product->id,
                    'author_name' => $review['name'],
                    'author_email' => $review['email'],
                    'avatar_path' => $review['avatar'],
                    'rating' => $review['rating'],
                    'body' => self::LOREM,
                ]))->setCreatedAt($review['at'])->setUpdatedAt($review['at'])->save();
            }

            $thread = $this->comment($product, null, 'Blake Ruiz', 'blake.ruiz@example.com', 'product/review-1.png', '2026-02-12 17:56:00');
            $this->comment($product, $thread, 'Karma Support', 'support@example.com', 'product/review-2.png', '2026-02-12 18:30:00');
            $this->comment($product, null, 'Sam Patel', 'sam.patel@example.com', 'product/review-3.png', '2026-03-21 11:15:00');
        }
    }

    private function comment(Product $product, ?Comment $parent, string $name, string $email, string $avatar, string $at): Comment
    {
        $comment = $product->comments()->make([
            'parent_id' => $parent?->id,
            'author_name' => $name,
            'author_email' => $email,
            'avatar_path' => $avatar,
            'body' => self::LOREM,
        ]);
        $comment->setCreatedAt($at)->setUpdatedAt($at)->save();

        return $comment;
    }
}
