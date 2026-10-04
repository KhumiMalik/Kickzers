<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BlogTagFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug'])]
final class BlogTag extends Model
{
    /** @use HasFactory<BlogTagFactory> */
    use HasFactory;

    /** @return BelongsToMany<Post, $this> */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'blog_tag_post');
    }
}
