<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Copies the demo images in database/seeders/assets onto the "public" disk,
 * keeping their relative paths ("product/p1.jpg"). The demo seeders store
 * those same paths in the image columns.
 */
final class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $disk = Storage::disk('public');

        foreach (File::allFiles(database_path('seeders/assets')) as $file) {
            $disk->put(str_replace('\\', '/', $file->getRelativePathname()), $file->getContents());
        }
    }
}
