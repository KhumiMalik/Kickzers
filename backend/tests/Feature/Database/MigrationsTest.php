<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schema;

it('rolls every migration back and runs them again', function (): void {
    $this->artisan('migrate:reset')->assertSuccessful();

    expect(Schema::hasTable('products'))->toBeFalse()
        ->and(Schema::hasTable('orders'))->toBeFalse();

    $this->artisan('migrate')->assertSuccessful();

    expect(Schema::hasTable('products'))->toBeTrue()
        ->and(Schema::hasTable('orders'))->toBeTrue();
});

it('does not create the personal access tokens table (the SPA uses session cookies)', function (): void {
    expect(Schema::hasTable('personal_access_tokens'))->toBeFalse();
});
