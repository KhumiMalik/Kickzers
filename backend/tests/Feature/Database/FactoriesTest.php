<?php

declare(strict_types=1);

use App\Enums\AddressType;
use App\Models\Banner;
use App\Models\BlogAuthor;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Color;
use App\Models\Comment;
use App\Models\ContactMessage;
use App\Models\Country;
use App\Models\CountryState;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\NewsletterSubscriber;
use App\Models\Order;
use App\Models\OrderAddress;
use App\Models\OrderItem;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSpecification;
use App\Models\Promotion;
use App\Models\Review;
use App\Models\ShippingRate;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Database\Eloquent\Model;

/*
 * Smoke test: every factory's default state produces a row the schema accepts
 * (NOT NULL columns, foreign keys, unique indexes). Strict mode also fails
 * here if a factory sets an attribute that is not fillable.
 */
it('creates a valid row from the default factory state', function (string $model): void {
    /** @var class-string<Model> $model */
    $created = $model::factory()->create();

    expect($created->exists)->toBeTrue();
})->with([
    Banner::class, BlogAuthor::class, BlogCategory::class, BlogTag::class, Brand::class, Cart::class,
    CartItem::class, Category::class, Color::class, Comment::class, ContactMessage::class, Country::class,
    CountryState::class, Coupon::class, CouponRedemption::class, NewsletterSubscriber::class, Order::class,
    OrderAddress::class, OrderItem::class, Post::class, Product::class, ProductImage::class,
    ProductSpecification::class, Promotion::class, Review::class, ShippingRate::class, User::class,
    WishlistItem::class,
]);

it('builds an order with consistent amounts, items and both addresses', function (): void {
    $product = Product::factory()->priced(2500)->create();
    $order = Order::factory()->create(['subtotal' => 5000, 'shipping_total' => 1000, 'total' => 6000]);
    OrderItem::factory()->for($order)->forProduct($product, 2)->create();
    OrderAddress::factory()->for($order)->create();
    OrderAddress::factory()->for($order)->shipping()->create();

    $order->refresh();

    expect($order->items->sum('line_total'))->toBe($order->subtotal)
        ->and($order->billingAddress?->type)->toBe(AddressType::Billing)
        ->and($order->shippingAddress?->email)->toBeNull()
        ->and($order->getRouteKey())->toBe($order->number);
});

it('gives a logged-in user a cart without a guest token', function (): void {
    $user = User::factory()->create();
    $cart = Cart::factory()->forUser($user)->create();

    expect($cart->token)->toBeNull()
        ->and($user->cart?->is($cart))->toBeTrue();
});
