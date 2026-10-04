<?php

declare(strict_types=1);

use App\Actions\Orders\GenerateOrderNumber;
use App\Models\Order;

it('builds the number from the year and the zero-padded id', function (int $id, string $placedAt, string $expected): void {
    $order = new Order(['placed_at' => $placedAt]);
    $order->id = $id;

    expect((new GenerateOrderNumber)->handle($order))->toBe($expected);
})->with([
    [1, '2026-10-04 12:00:00', 'KZ-2026-000001'],
    [42, '2027-01-01 00:00:00', 'KZ-2027-000042'],
    // Past a million orders the number simply grows; it stays unique.
    [1234567, '2026-12-31 23:59:59', 'KZ-2026-1234567'],
]);
