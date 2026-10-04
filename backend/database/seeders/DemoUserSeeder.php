<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/** A customer account to log in with while developing: jane@example.com / password. */
final class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        // The "hashed" cast on User hashes the password on save.
        User::query()->updateOrCreate(
            ['email' => 'jane@example.com'],
            ['name' => 'Jane Doe', 'password' => 'password'],
        );
    }
}
