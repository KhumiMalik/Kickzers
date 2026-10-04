<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| Feature tests boot the Laravel application and run against a fresh
| in-memory SQLite database (see phpunit.xml). Unit tests are plain PHP.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/**
 * Headers of a request made by the React app. Sanctum only starts a session
 * (and so allows login) for requests from the SPA's origin.
 *
 * @return array{Origin: string, Referer: string}
 */
function spaHeaders(): array
{
    $origin = config()->string('shop.frontend_url');

    return ['Origin' => $origin, 'Referer' => $origin.'/'];
}

/**
 * Number of database queries `$callback` runs. Endpoint tests compare it for
 * a few rows and for many rows: equal counts prove there is no N+1 query.
 * (Strict mode also throws on any lazy load outside production.)
 */
function queryCount(Closure $callback): int
{
    DB::flushQueryLog();
    DB::enableQueryLog();

    $callback();

    $count = count(DB::getQueryLog());
    DB::disableQueryLog();

    return $count;
}
