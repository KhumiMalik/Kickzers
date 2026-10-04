<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Number;

/**
 * Formats integer minor units for messages ("Spend $50.00 or more…").
 * Amounts in API payloads stay integers; only human-readable text is formatted.
 */
final class Money
{
    public static function format(int $minorUnits): string
    {
        $formatted = Number::currency($minorUnits / 100, in: config()->string('shop.currency'), locale: 'en');

        return $formatted === false ? (string) $minorUnits : $formatted;
    }
}
