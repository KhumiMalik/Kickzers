<?php

declare(strict_types=1);

namespace App\Enums;

enum ProductStatus: string
{
    case Active = 'active';
    case ComingSoon = 'coming_soon';
    case Draft = 'draft';

    /** Visible in the shop (active products and announced, not-yet-available ones). */
    public function isPublished(): bool
    {
        return $this !== self::Draft;
    }

    /** @return list<self> */
    public static function published(): array
    {
        return [self::Active, self::ComingSoon];
    }
}
