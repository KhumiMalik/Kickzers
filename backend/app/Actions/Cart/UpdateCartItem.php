<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\Exceptions\CartException;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

/** Sets the quantity of a cart line (the cart page stepper). */
final readonly class UpdateCartItem
{
    public function __construct(private CheckStock $checkStock) {}

    /** @throws CartException */
    public function handle(CartItem $item, int $quantity): void
    {
        DB::transaction(function () use ($item, $quantity): void {
            $product = Product::query()->findOrFail($item->product_id);

            $this->checkStock->ensureAvailable($product, $quantity);

            $item->update(['quantity' => $quantity]);
        });
    }
}
