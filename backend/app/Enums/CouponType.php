<?php

declare(strict_types=1);

namespace App\Enums;

enum CouponType: string
{
    /** `value` is a whole percentage of the subtotal (10 = 10%). */
    case Percent = 'percent';

    /** `value` is an amount in minor units (2000 = $20.00), capped at the subtotal. */
    case Fixed = 'fixed';
}
