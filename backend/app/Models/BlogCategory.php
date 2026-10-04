<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BlogCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Blog category. Categories with a `featured_position` are also shown as the
 * cards above the blog list (with their own title, tagline and image).
 */
#[Fillable(['name', 'slug', 'featured_title', 'featured_tagline', 'featured_image_path', 'featured_position'])]
final class BlogCategory extends Model
{
    /** @use HasFactory<BlogCategoryFactory> */
    use HasFactory;

    /** @return BelongsToMany<Post, $this> */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'blog_category_post');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['featured_position' => 'integer'];
    }
}
