<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Enums\PromotionType;
use App\Exceptions\NoActivePromotionException;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Catalog\PromotionResource;
use App\Repositories\Catalog\PromotionRepository;

/** `GET /promotions/deals-of-the-week`: the block at the bottom of the shop page. */
final class DealsOfTheWeekController extends Controller
{
    private const int PRODUCT_LIMIT = 9;

    public function __construct(private readonly PromotionRepository $promotions) {}

    public function __invoke(): PromotionResource
    {
        $promotion = $this->promotions->running(PromotionType::DealsOfTheWeek, self::PRODUCT_LIMIT)
            ?? throw new NoActivePromotionException;

        return new PromotionResource($promotion);
    }
}
