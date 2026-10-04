<?php

declare(strict_types=1);

namespace App\Repositories\Wishlist;

use App\Models\Builders\ProductBuilder;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

/**
 * Saved products of logged-in customers. Guests keep theirs in the browser
 * and send them to merge() once after logging in.
 *
 * @extends BaseRepository<WishlistItem>
 */
final class WishlistRepository extends BaseRepository
{
    protected string $model = WishlistItem::class;

    /**
     * The customer's saved products, most recently saved first. Products
     * that have since become drafts are left out (but stay saved).
     *
     * @return Collection<int, Product>
     */
    public function productsFor(User $user): Collection
    {
        return $this->query()
            ->whereBelongsTo($user)
            ->whereHas('product', fn (ProductBuilder $query) => $query->published())
            ->with(ProductBuilder::summaryRelations('product'))
            ->latest()
            ->orderByDesc('id')
            ->get()
            ->map(fn (WishlistItem $item): ?Product => $item->product)
            ->filter()
            ->values();
    }

    /**
     * Saves a product. Returns false when it was already saved.
     * createOrFirst relies on the (user_id, product_id) unique index, so two
     * simultaneous clicks cannot create a duplicate row.
     */
    public function add(User $user, Product $product): bool
    {
        return $this->query()
            ->createOrFirst(['user_id' => $user->id, 'product_id' => $product->id])
            ->wasRecentlyCreated;
    }

    /** Removes a product; removing one that is not saved is not an error. */
    public function remove(User $user, int $productId): void
    {
        $this->query()->whereBelongsTo($user)->where('product_id', $productId)->delete();
    }

    /**
     * Adds the guest's locally saved products. Ids that are unknown or not
     * published (e.g. a product removed since it was saved) are skipped rather
     * than failing the whole merge; already-saved products are ignored by the
     * unique index (INSERT … IGNORE / ON CONFLICT DO NOTHING).
     *
     * @param  list<int>  $productIds
     */
    public function merge(User $user, array $productIds): void
    {
        $publishedIds = Product::query()->published()->whereKey($productIds)->pluck('id');
        $now = now();

        $this->query()->insertOrIgnore($publishedIds->map(fn (int $productId): array => [
            'user_id' => $user->id,
            'product_id' => $productId,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());
    }
}
