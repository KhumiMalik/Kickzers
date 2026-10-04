<?php

declare(strict_types=1);

namespace App\DTOs\Catalog;

/** A product's star rating: average (one decimal), number of reviews and count per star. */
final readonly class RatingSummary
{
    /**
     * @param  array<int, int>  $breakdown  stars (5 → 1) => number of reviews
     */
    public function __construct(
        public float $average,
        public int $count,
        public array $breakdown,
    ) {}

    /**
     * @param  array<int, int>  $countsByStars  only the star values that have reviews
     */
    public static function fromCounts(array $countsByStars): self
    {
        $breakdown = [];
        foreach ([5, 4, 3, 2, 1] as $stars) {
            $breakdown[$stars] = $countsByStars[$stars] ?? 0;
        }

        $count = array_sum($breakdown);
        $total = 0;
        foreach ($breakdown as $stars => $reviews) {
            $total += $stars * $reviews;
        }

        return new self(
            average: $count === 0 ? 0.0 : round($total / $count, 1),
            count: $count,
            breakdown: $breakdown,
        );
    }
}
