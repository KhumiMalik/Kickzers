<?php

declare(strict_types=1);

namespace App\Enums;

/** Sort options of the shop listing (the `sort` query parameter). */
enum ProductSort: string
{
    case Default = 'default';
    case Newest = 'newest';
    case PriceAsc = 'price-asc';
    case PriceDesc = 'price-desc';
    case Name = 'name';
}
