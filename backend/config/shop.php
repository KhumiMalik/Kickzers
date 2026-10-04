<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Storefront
    |--------------------------------------------------------------------------
    |
    | Settings of the Kickzers domain. Application code reads these with
    | config('shop.*'); never call env() outside the config directory.
    |
    */

    // URL of the React SPA (used for CORS and links in emails).
    'frontend_url' => is_string(env('FRONTEND_URL')) ? env('FRONTEND_URL') : 'http://localhost:5173',

    // ISO 4217 currency of every amount; amounts are stored as integer minor units.
    'currency' => 'USD',

    // ISO 3166-1 alpha-2 code of the store's country (domestic-only shipping methods).
    'store_country' => 'US',

    // Rate limits (login, checkout, tracking, submissions). Always on, except for the
    // end-to-end test server, whose browser tests submit many forms from one IP.
    'rate_limiting' => env('SHOP_RATE_LIMITING') !== false && env('SHOP_RATE_LIMITING') !== 'false',

    // Where contact-form notifications are sent.
    'admin_email' => is_string(env('SHOP_ADMIN_EMAIL')) ? env('SHOP_ADMIN_EMAIL') : 'admin@example.com',

];
