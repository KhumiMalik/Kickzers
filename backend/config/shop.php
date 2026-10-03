<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Storefront
    |--------------------------------------------------------------------------
    |
    | Settings of the Karma Shop domain. Application code reads these with
    | config('shop.*'); never call env() outside the config directory.
    |
    */

    // URL of the React SPA (used for CORS and links in emails).
    'frontend_url' => is_string(env('FRONTEND_URL')) ? env('FRONTEND_URL') : 'http://localhost:5173',

    // ISO 4217 currency of every amount; amounts are stored as integer minor units.
    'currency' => 'USD',

    // ISO 3166-1 alpha-2 code of the store's country (domestic-only shipping methods).
    'store_country' => 'US',

    // Where contact-form notifications are sent.
    'admin_email' => is_string(env('SHOP_ADMIN_EMAIL')) ? env('SHOP_ADMIN_EMAIL') : 'admin@example.com',

];
