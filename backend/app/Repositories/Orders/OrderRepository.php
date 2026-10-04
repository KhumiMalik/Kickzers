<?php

declare(strict_types=1);

namespace App\Repositories\Orders;

use App\Models\Order;
use App\Models\User;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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

    /** Loads everything the order page shows (Order resource). */
    public function loadDetail(Order $order): Order
    {
        return $order->load(['items', 'billingAddress', 'shippingAddress']);
    }
}
