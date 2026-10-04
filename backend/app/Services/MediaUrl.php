<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Image columns store paths on the "public" disk ("product/p1.jpg"); the API
 * returns absolute URLs ("http://localhost:8000/storage/product/p1.jpg") so
 * the frontend can use them as-is, whatever host serves the files.
 */
final class MediaUrl
{
    public static function for(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
