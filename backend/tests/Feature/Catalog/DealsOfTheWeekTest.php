<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Promotion;

it('returns the running deals with their products in display order', function (): void {
    [$first, $second] = Product::factory()->count(2)->create();
    $draft = Product::factory()->draft()->create();
    $promotion = Promotion::factory()->create(['ends_at' => now()->addDays(3)->startOfSecond()]);
    $promotion->products()->attach([
        $second->id => ['position' => 1],
        $first->id => ['position' => 0],
        $draft->id => ['position' => 2],
    ]);

    $this->getJson(route('api.v1.promotions.deals-of-the-week'))
        ->assertOk()
        ->assertJsonPath('data.ends_at', $promotion->ends_at->toIso8601ZuluString())
        ->assertJsonCount(2, 'data.products')
        ->assertJsonPath('data.products.0.id', $first->id)
        ->assertJsonPath('data.products.1.id', $second->id);
});

it('answers 404 with a code when no deals are running', function (): void {
    Promotion::factory()->expired()->create();

    $this->getJson(route('api.v1.promotions.deals-of-the-week'))
        ->assertNotFound()
        ->assertExactJson(['message' => 'No active promotion.', 'code' => 'no_active_promotion']);
});
