<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Catalog;

use App\DTOs\Catalog\HomePage;
use App\Enums\PromotionType;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Catalog\HomeResource;
use App\Repositories\Catalog\BannerRepository;
use App\Repositories\Catalog\ProductRepository;
use App\Repositories\Catalog\PromotionRepository;

/** `GET /home`: everything the home page shows, in one request. */
final class HomeController extends Controller
{
    private const int LATEST_LIMIT = 8;

    private const int COMING_SOON_LIMIT = 8;

    private const int WEEKLY_DEALS_LIMIT = 9;

    public function __construct(
        private readonly BannerRepository $banners,
        private readonly ProductRepository $products,
        private readonly PromotionRepository $promotions,
    ) {}

    public function __invoke(): HomeResource
    {
        return new HomeResource(new HomePage(
            heroSlides: $this->banners->activeSlides(),
            latest: $this->products->latest(self::LATEST_LIMIT),
            comingSoon: $this->products->comingSoon(self::COMING_SOON_LIMIT),
            exclusiveDeal: $this->promotions->running(PromotionType::ExclusiveDeal),
            dealsOfTheWeek: $this->promotions->running(PromotionType::DealsOfTheWeek, self::WEEKLY_DEALS_LIMIT),
        ));
    }
}
