<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

final class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Reference data always; demo content (catalog, blog, demo user, images)
     * only outside production.
     */
    public function run(): void
    {
        $this->call(ReferenceDataSeeder::class);

        if (app()->isProduction()) {
            return;
        }

        $this->call([
            MediaSeeder::class,
            CatalogSeeder::class,
            BlogSeeder::class,
            DemoUserSeeder::class,
        ]);
    }
}
