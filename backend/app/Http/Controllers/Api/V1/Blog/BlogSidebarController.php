<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Blog\BlogSidebarResource;
use App\Repositories\Blog\BlogSidebarRepository;

/** `GET /blog/sidebar`: author, popular posts, categories, tags and the featured cards. */
final class BlogSidebarController extends Controller
{
    public function __construct(private readonly BlogSidebarRepository $sidebar) {}

    public function __invoke(): BlogSidebarResource
    {
        return new BlogSidebarResource($this->sidebar->sidebar());
    }
}
