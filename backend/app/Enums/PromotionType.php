<?php

declare(strict_types=1);

namespace App\Enums;

enum PromotionType: string
{
    /** "Exclusive Hot Deal" slider with the home page countdown. */
    case ExclusiveDeal = 'exclusive_deal';

    /** "Deals of the Week" product block. */
    case DealsOfTheWeek = 'deals_of_the_week';
}
