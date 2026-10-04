<?php

declare(strict_types=1);

namespace App\Repositories\Orders;

use App\Models\Order;
use App\Models\User;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * @extends BaseRepository<Order>
 */
final class OrderRepository extends BaseRepository
{
    protected string $model = Order::class;

    /**
     * A customer's order history, newest first, with the number of items
     * (sum of quantities) for the list.
     *
     * @return LengthAwarePaginator<int, Order>
     */
    public function historyFor(User $user, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->whereBelongsTo($user)
            ->withSum('items', 'quantity')
            ->orderByDesc('placed_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /** The order a checkout attempt with this Idempotency-Key already placed. */
    public function findByIdempotencyKey(string $key): ?Order
    {
        return $this->query()->where('idempotency_key', $key)->first();
    }

    /**
     * The tracking form lookup: both the number and the billing e-mail must
     * match (the number alone is not a secret), with the item count.
     */
    public function findForTracking(string $number, string $email): ?Order
    {
        return $this->query()
            ->where('number', Str::upper(trim($number)))
            ->where('email', Str::lower(trim($email)))
            ->withSum('items', 'quantity')
            ->first();
    }

    /** Loads everything the order page shows (Order resource). */
    public function loadDetail(Order $order): Order
    {
        return $order->load(['items', 'billingAddress', 'shippingAddress']);
    }
}
