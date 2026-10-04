<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Account\ListOrdersRequest;
use App\Http\Resources\Api\V1\Orders\OrderResource;
use App\Http\Resources\Api\V1\Orders\OrderSummaryResource;
use App\Models\Order;
use App\Models\User;
use App\Repositories\Orders\OrderRepository;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

/** The logged-in customer's order history (`/account/orders`). */
final class OrderController extends Controller
{
    public function __construct(private readonly OrderRepository $orders) {}

    public function index(ListOrdersRequest $request, #[CurrentUser] User $user): AnonymousResourceCollection
    {
        $orders = $this->orders
            ->historyFor($user, $request->perPage())
            ->appends($request->query());

        return OrderSummaryResource::collection($orders);
    }

    /** 403 when the order belongs to someone else (OrderPolicy::view). */
    public function show(Order $order): OrderResource
    {
        Gate::authorize('view', $order);

        return new OrderResource($this->orders->loadDetail($order));
    }
}
