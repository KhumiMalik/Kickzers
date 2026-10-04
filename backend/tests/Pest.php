<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
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
 * A valid checkout form (contract §10.1), with `$overrides` merged in.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function checkoutPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'billing' => [
            'first_name' => 'Jane', 'last_name' => 'Doe', 'company' => null, 'phone' => '0300 1234567',
            'email' => 'jane@example.com', 'country' => 'US', 'state' => 'California', 'city' => 'Los Angeles',
            'address_line_1' => '12 Mall Road', 'address_line_2' => null, 'postcode' => '90001',
        ],
        'ship_to_different_address' => false,
        'shipping_address' => null,
        'notes' => null,
        'payment_method' => 'cash_on_delivery',
        'create_account' => false,
        'password' => null,
        'accept_terms' => true,
    ], $overrides);
}

/**
 * A guest cart holding `$quantity` of each product.
 *
 * @param  list<Product>  $products
 */
function guestCartWith(array $products, int $quantity = 1): Cart
{
    $cart = Cart::factory()->create();

    foreach ($products as $product) {
        CartItem::factory()->for($cart)->for($product)->quantity($quantity)->create();
    }

    return $cart;
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
