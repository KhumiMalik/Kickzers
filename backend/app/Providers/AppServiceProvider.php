<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Post;
use App\Models\Product;
use App\Repositories\Blog\PostRepository;
use App\Repositories\Catalog\ProductRepository;
use App\Services\Payments\CashOnDeliveryGateway;
use App\Services\Payments\CheckPaymentGateway;
use App\Services\Payments\PaymentGatewayRegistry;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // The payment methods the checkout offers, in display order.
        $this->app->singleton(PaymentGatewayRegistry::class, fn (): PaymentGatewayRegistry => new PaymentGatewayRegistry(
            new CashOnDeliveryGateway,
            new CheckPaymentGateway,
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Outside production, fail loudly on lazy loading (N+1), silently discarded
        // attributes and access to missing attributes.
        Model::shouldBeStrict(! $this->app->isProduction());

        // Polymorphic relations store these short names instead of PHP class names, so
        // renaming a class never breaks existing rows (comments.commentable_type).
        Relation::enforceMorphMap([
            'product' => Product::class,
            'post' => Post::class,
        ]);

        $this->configureRouteBindings();
        $this->configureRateLimiting();
    }

    /**
     * Storefront URLs use slugs and must never reveal drafts: {product} and
     * {post} resolve through the repositories' "published" lookups, so an
     * unpublished slug is a plain 404 ("Product not found.").
     */
    private function configureRouteBindings(): void
    {
        Route::bind('product', fn (string $slug): Product => $this->app->make(ProductRepository::class)->findPublishedBySlug($slug));
        Route::bind('post', fn (string $slug): Post => $this->app->make(PostRepository::class)->findPublishedBySlug($slug));
    }

    /**
     * Named limiters used by the API routes (docs/api-contract.md §1.9).
     */
    private function configureRateLimiting(): void
    {
        // Only the end-to-end test server switches limits off (SHOP_RATE_LIMITING=false).
        if (! config()->boolean('shop.rate_limiting')) {
            foreach (['api', 'auth', 'checkout', 'tracking', 'submissions'] as $limiter) {
                RateLimiter::for($limiter, fn (): Limit => Limit::none());
            }

            return;
        }

        RateLimiter::for('api', fn (Request $request): Limit => Limit::perMinute(120)
            ->by($request->user()?->getAuthIdentifier() ?? $request->ip()));

        // Keyed by email + IP: an IP alone would lock out shared networks, an email
        // alone would let anyone lock a victim out of their account.
        RateLimiter::for('auth', fn (Request $request): Limit => Limit::perMinute(5)
            ->by(Str::transliterate(Str::lower($request->string('email')->toString()).'|'.$request->ip())));

        RateLimiter::for('checkout', fn (Request $request): Limit => Limit::perMinute(10)
            ->by($request->user()?->getAuthIdentifier() ?? $request->ip()));

        RateLimiter::for('tracking', fn (Request $request): Limit => Limit::perMinute(10)->by($request->ip()));

        // Reviews, comments, contact messages and newsletter sign-ups.
        RateLimiter::for('submissions', fn (Request $request): array => [
            Limit::perMinute(5)->by('minute|'.$request->ip()),
            Limit::perDay(50)->by('day|'.$request->ip()),
        ]);
    }
}
