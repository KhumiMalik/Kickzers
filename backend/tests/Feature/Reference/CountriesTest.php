<?php

declare(strict_types=1);

use Database\Seeders\ReferenceDataSeeder;

it('lists the countries in display order with their states', function (): void {
    $this->seed(ReferenceDataSeeder::class);

    $this->getJson(route('api.v1.countries.index'))
        ->assertOk()
        ->assertJsonCount(5, 'data')
        ->assertJsonPath('data.0', ['code' => 'US', 'name' => 'United States', 'states' => ['California', 'Florida', 'New York', 'Texas']])
        ->assertJsonPath('data.*.code', ['US', 'GB', 'PK', 'IN', 'BD']);
});

it('runs two queries: countries and all their states', function (): void {
    $this->seed(ReferenceDataSeeder::class);

    expect(queryCount(fn () => $this->getJson(route('api.v1.countries.index'))->assertOk()))->toBe(2);
});
