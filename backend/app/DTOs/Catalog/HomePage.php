<?php

declare(strict_types=1);

namespace App\DTOs\Catalog;

use App\Models\Banner;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Collection;

/** Everything `GET /home` returns, gathered from several repositories. */
final readonly class HomePage
{
    /**
     * @param  Collection<int, Banner>  $heroSlides
     * @param  Collection<int, Product>  $latest
     * @param  Collection<int, Product>  $comingSoon
     */
    public function __construct(
        public Collection $heroSlides,
        public Collection $latest,
        public Collection $comingSoon,
        public ?Promotion $exclusiveDeal,
        public ?Promotion $dealsOfTheWeek,
    ) {}
}
