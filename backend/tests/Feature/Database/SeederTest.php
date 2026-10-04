<?php

declare(strict_types=1);

use App\Enums\CouponType;
use App\Enums\ProductStatus;
use App\Enums\PromotionType;
use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\Comment;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\Post;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Review;
use App\Models\ShippingRate;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function (): void {
    Storage::fake('public');
});

it('seeds the same catalog the frontend mock server used', function (): void {
    $this->seed(DatabaseSeeder::class);

    expect(Product::query()->count())->toBe(18)
        ->and(Product::query()->comingSoon()->count())->toBe(4)
        ->and(Product::query()->available()->count())->toBe(14);

    $product = Product::query()->where('slug', 'aero-knit-running-shoe')->firstOrFail();

    expect($product->sku)->toBe('KZ-0001')
        ->and($product->price)->toBe(15000)
        ->and($product->compare_at_price)->toBe(21000)
        ->and($product->status)->toBe(ProductStatus::Active)
        ->and($product->category->slug)->toBe('running')
        ->and($product->category->parent?->slug)->toBe('men-shoes')
        ->and($product->brand->name)->toBe('Adidas')
        ->and($product->images()->count())->toBe(3)
        ->and($product->specifications()->pluck('label')->first())->toBe('Upper');

    expect(Review::query()->where('product_id', $product->id)->avg('rating'))->toEqual(4.0)
        ->and(Comment::query()->whereMorphedTo('commentable', $product)->count())->toBe(3);
});

it('seeds running promotions in the mock order', function (): void {
    $this->seed(DatabaseSeeder::class);

    $exclusive = Promotion::query()->running(PromotionType::ExclusiveDeal)->sole();
    $weekly = Promotion::query()->running(PromotionType::DealsOfTheWeek)->sole();

    expect($exclusive->products->pluck('slug')->all())->toBe(['zoom-flight-basketball-shoe', 'comic-hi-top-canvas'])
        ->and($weekly->products)->toHaveCount(8);
});

it('seeds the blog with its featured category cards and comment threads', function (): void {
    $this->seed(DatabaseSeeder::class);

    expect(Post::query()->published()->count())->toBe(9)
        ->and(Post::query()->newestFirst()->first()?->slug)->toBe('astronomy-binoculars-a-great-alternative')
        ->and(BlogAuthor::query()->where('is_featured', true)->sole()->name)->toBe('Charlie Barber')
        ->and(BlogCategory::query()->whereNotNull('featured_position')->orderBy('featured_position')->pluck('featured_title')->all())
        ->toBe(['Social Life', 'Politics', 'Food']);

    $post = Post::query()->where('slug', 'the-night-sky')->firstOrFail();

    expect($post->comments()->count())->toBe(5)
        ->and($post->comments()->topLevel()->count())->toBe(3)
        ->and($post->gallery)->toBe(['blog/post-img1.jpg', 'blog/post-img2.jpg'])
        ->and($post->categories->pluck('slug')->sort()->values()->all())->toBe(['adventure', 'lifestyle']);
});

it('seeds reference data, coupons and the demo user', function (): void {
    $this->seed(DatabaseSeeder::class);

    expect(Country::query()->orderBy('position')->pluck('code')->all())->toBe(['US', 'GB', 'PK', 'IN', 'BD'])
        ->and(Country::query()->findOrFail('PK')->states()->pluck('name')->all())->toContain('Punjab')
        ->and(ShippingRate::query()->whereNull('country_code')->pluck('price', 'method')->all())
        ->toEqual(['flat_rate_5' => 500, 'free' => 0, 'flat_rate_10' => 1000, 'local_delivery' => 200])
        ->and(Coupon::query()->where('code', 'SAVE20')->sole()->type)->toBe(CouponType::Fixed);

    $user = User::query()->where('email', 'jane@example.com')->sole();

    expect(Hash::check('password', $user->password))->toBeTrue();
});

it('copies the demo images onto the public disk', function (): void {
    $this->seed(DatabaseSeeder::class);

    Storage::disk('public')->assertExists(['product/p1.jpg', 'banner/banner-img.png', 'blog/author.png', 'l1.jpg']);
});

it('can run the reference data seeder again without duplicating rows', function (): void {
    $this->seed(ReferenceDataSeeder::class);
    $this->seed(ReferenceDataSeeder::class);

    expect(Country::query()->count())->toBe(5)
        ->and(ShippingRate::query()->count())->toBe(4)
        ->and(Coupon::query()->count())->toBe(2);
});

it('seeds only reference data in production', function (): void {
    $this->app->detectEnvironment(fn (): string => 'production');

    // In production db:seed asks for confirmation unless --force is given (as a deploy script would).
    $this->artisan('db:seed', ['--force' => true])->assertSuccessful();

    expect(Country::query()->count())->toBe(5)
        ->and(Product::query()->count())->toBe(0)
        ->and(User::query()->count())->toBe(0);
});
