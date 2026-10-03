<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

final class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Outside production, fail loudly on lazy loading (N+1), silently discarded
        // attributes and access to missing attributes.
        Model::shouldBeStrict(! $this->app->isProduction());

        $this->configureRateLimiting();
    }

    /**
     * Named limiters used by the API routes (docs/api-contract.md §1.9).
     */
    private function configureRateLimiting(): void
    {
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
