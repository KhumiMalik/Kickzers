<?php

declare(strict_types=1);

namespace App\Repositories\Content;

use App\DTOs\Catalog\RatingSummary;
use App\Models\Product;
use App\Models\Review;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<Review>
 */
final class ReviewRepository extends BaseRepository
{
    protected string $model = Review::class;

    /**
     * Approved reviews of a product, newest first.
     *
     * @return LengthAwarePaginator<int, Review>
     */
    public function approvedFor(Product $product, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('product_id', $product->id)
            ->approved()
            ->latest()
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Average, count and per-star breakdown from one grouped query
     * (SELECT rating, COUNT(*) … GROUP BY rating) on the indexed product_id.
     */
    public function ratingSummaryFor(Product $product): RatingSummary
    {
        // Aggregates arrive as strings on some drivers (MySQL), hence the int conversion.
        $countsByStars = $this->query()
            ->where('product_id', $product->id)
            ->approved()
            ->toBase()
            ->selectRaw('rating, count(*) as reviews')
            ->groupBy('rating')
            ->pluck('reviews', 'rating')
            ->mapWithKeys(fn (mixed $reviews, mixed $rating): array => [(int) $rating => (int) $reviews])
            ->all();

        return RatingSummary::fromCounts($countsByStars);
    }
}
