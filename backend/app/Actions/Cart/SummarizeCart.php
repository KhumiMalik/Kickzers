<?php

declare(strict_types=1);

namespace App\Actions\Cart;

use App\DTOs\Cart\CartSummary;
use App\Models\Cart;
use App\Repositories\Cart\CartRepository;

/**
 * Builds what every cart endpoint returns: reconciles the stored cart,
 * prices it for its destination and hands out the pending notices (which
 * are then cleared, so each toast is shown once).
 */
final readonly class SummarizeCart
{
    public function __construct(
        private CartRepository $carts,
        private QuoteShippingOptions $quoteShipping,
        private ReconcileCart $reconcile,
        private CalculateCartTotals $calculateTotals,
    ) {}

    public function handle(Cart $cart): CartSummary
    {
        $shippingOptions = $this->quoteShipping->handle($cart->destination_country);

        if ($cart->exists) {
            $this->carts->loadForSummary($cart);
            $this->reconcile->handle($cart, $shippingOptions);
        }

        $totals = $this->calculateTotals->handle($cart, $shippingOptions);
        $notices = $cart->pendingNotices();

        if ($notices !== [] && $cart->exists) {
            $cart->update(['notices' => []]);
        }

        return new CartSummary($cart, $totals, $shippingOptions, $notices);
    }
}
