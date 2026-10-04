<?php

declare(strict_types=1);

use App\DTOs\Catalog\RatingSummary;
use App\Models\Product;
use App\Services\MediaUrl;
use App\Services\Money;

it('formats minor units as money for messages', function (int $minorUnits, string $expected): void {
    expect(Money::format($minorUnits))->toBe($expected);
})->with([
    [5000, '$50.00'],
    [123456, '$1,234.56'],
    [5, '$0.05'],
    [0, '$0.00'],
]);

it('turns public-disk paths into absolute URLs', function (): void {
    expect(MediaUrl::for('product/p1.jpg'))->toEndWith('/storage/product/p1.jpg')
        ->and(MediaUrl::for('product/p1.jpg'))->toStartWith('http')
        ->and(MediaUrl::for(null))->toBeNull()
        ->and(MediaUrl::for(''))->toBeNull();
});

it('summarises ratings with a one-decimal average and every star present', function (): void {
    $summary = RatingSummary::fromCounts([5 => 2, 4 => 1]);

    expect($summary->count)->toBe(3)
        ->and($summary->average)->toBe(4.7)
        ->and($summary->breakdown)->toBe([5 => 2, 4 => 1, 3 => 0, 2 => 0, 1 => 0])
        ->and(RatingSummary::fromCounts([])->average)->toBe(0.0);
});

it('splits long texts into paragraphs on blank lines', function (?string $text, array $expected): void {
    expect((new Product(['description' => $text]))->descriptionParagraphs())->toBe($expected);
})->with([
    'two paragraphs' => ["First.\n\nSecond.", ['First.', 'Second.']],
    'windows line endings and extra blank lines' => ["First.\r\n\r\n\r\nSecond.", ['First.', 'Second.']],
    'a single line break stays in the paragraph' => ["Line one\nline two", ["Line one\nline two"]],
    'surrounding whitespace' => ["  \n\nOnly.\n\n  ", ['Only.']],
    'empty' => ['', []],
]);
