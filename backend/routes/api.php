<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\RegisteredUserController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\Blog\BlogSidebarController;
use App\Http\Controllers\Api\V1\Blog\PostController;
use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Cart\CartCouponController;
use App\Http\Controllers\Api\V1\Cart\CartDestinationController;
use App\Http\Controllers\Api\V1\Cart\CartItemController;
use App\Http\Controllers\Api\V1\Cart\CartShippingMethodController;
use App\Http\Controllers\Api\V1\Cart\CountryController;
use App\Http\Controllers\Api\V1\Catalog\CatalogFilterController;
use App\Http\Controllers\Api\V1\Catalog\DealsOfTheWeekController;
use App\Http\Controllers\Api\V1\Catalog\HomeController;
use App\Http\Controllers\Api\V1\Catalog\ProductController;
use App\Http\Controllers\Api\V1\Catalog\RelatedProductController;
use App\Http\Controllers\Api\V1\Checkout\CheckoutController;
use App\Http\Controllers\Api\V1\Checkout\PaymentMethodController;
use App\Http\Controllers\Api\V1\Comments\PostCommentController;
use App\Http\Controllers\Api\V1\Comments\ProductCommentController;
use App\Http\Controllers\Api\V1\Contact\ContactMessageController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Newsletter\NewsletterSubscriptionController;
use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Http\Controllers\Api\V1\Orders\TrackOrderController;
use App\Http\Controllers\Api\V1\Reviews\ProductReviewController;
use App\Http\Controllers\Api\V1\Wishlist\MergeWishlistController;
use App\Http\Controllers\Api\V1\Wishlist\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes — /api/v1 (docs/api-contract.md)
|--------------------------------------------------------------------------
|
| A breaking change gets a new /api/v2 group; additive changes stay in v1.
| {product} and {post} are slugs resolved to published records only
| (AppServiceProvider::configureRouteBindings).
|
*/

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::get('health', HealthController::class)->name('health');

    // Catalog (§5)
    Route::get('home', HomeController::class)->name('home');
    Route::get('catalog/filters', CatalogFilterController::class)->name('catalog.filters');
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('products/{product}/related', RelatedProductController::class)->name('products.related');
    Route::get('promotions/deals-of-the-week', DealsOfTheWeekController::class)->name('promotions.deals-of-the-week');

    // Reviews and comments (§6)
    Route::get('products/{product}/reviews', [ProductReviewController::class, 'index'])->name('products.reviews.index');
    Route::get('products/{product}/comments', [ProductCommentController::class, 'index'])->name('products.comments.index');
    Route::get('posts/{post}/comments', [PostCommentController::class, 'index'])->name('posts.comments.index');

    // Visitor submissions: 5 a minute and 50 a day per IP (the "submissions" limiter)
    Route::middleware('throttle:submissions')->group(function (): void {
        Route::post('products/{product}/reviews', [ProductReviewController::class, 'store'])->name('products.reviews.store');
        Route::post('products/{product}/comments', [ProductCommentController::class, 'store'])->name('products.comments.store');
        Route::post('posts/{post}/comments', [PostCommentController::class, 'store'])->name('posts.comments.store');
        Route::post('contact', ContactMessageController::class)->name('contact');
        Route::post('newsletter', NewsletterSubscriptionController::class)->name('newsletter');
    });

    // Blog (§7)
    Route::get('posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::get('blog/sidebar', BlogSidebarController::class)->name('blog.sidebar');

    // Cart (§9): guests by the kickzers_cart cookie, users by account. Every endpoint returns the Cart.
    Route::prefix('cart')->name('cart.')->group(function (): void {
        Route::get('/', [CartController::class, 'show'])->name('show');
        Route::delete('/', [CartController::class, 'destroy'])->name('destroy');
        Route::post('items', [CartItemController::class, 'store'])->name('items.store');
        Route::patch('items/{itemId}', [CartItemController::class, 'update'])->whereNumber('itemId')->name('items.update');
        Route::delete('items/{itemId}', [CartItemController::class, 'destroy'])->whereNumber('itemId')->name('items.destroy');
        Route::post('coupon', [CartCouponController::class, 'store'])->name('coupon.store');
        Route::delete('coupon', [CartCouponController::class, 'destroy'])->name('coupon.destroy');
        Route::put('shipping-method', CartShippingMethodController::class)->name('shipping-method');
        Route::put('destination', CartDestinationController::class)->name('destination');
    });

    // Checkout and orders (§10). {order} is the order number.
    Route::post('checkout', CheckoutController::class)->middleware('throttle:checkout')->name('checkout');
    Route::get('orders/{order}', OrderController::class)->name('orders.show');
    Route::post('orders/track', TrackOrderController::class)->middleware('throttle:tracking')->name('orders.track');

    // Reference data (§9, §10)
    Route::get('countries', CountryController::class)->name('countries.index');
    Route::get('payment-methods', PaymentMethodController::class)->name('payment-methods.index');

    // Auth (§3). Register/login answer 403 to logged-in users (their FormRequest authorize()).
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::middleware('throttle:auth')->group(function (): void {
            Route::post('register', RegisteredUserController::class)->name('register');
            Route::post('login', [SessionController::class, 'store'])->name('login');
        });

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [SessionController::class, 'destroy'])->name('logout');
            Route::get('user', CurrentUserController::class)->name('user');
        });
    });

    // Logged-in customers only (401 otherwise)
    Route::middleware('auth:sanctum')->group(function (): void {
        // Account (§4); {order} is the order number
        Route::get('account/orders', [AccountOrderController::class, 'index'])->name('account.orders.index');
        Route::get('account/orders/{order}', [AccountOrderController::class, 'show'])->name('account.orders.show');

        // Wishlist (§8)
        Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
        Route::post('wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
        Route::post('wishlist/merge', MergeWishlistController::class)->name('wishlist.merge');
        Route::delete('wishlist/{productId}', [WishlistController::class, 'destroy'])
            ->whereNumber('productId')
            ->name('wishlist.destroy');
    });
});
