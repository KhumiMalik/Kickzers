<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BlogAuthorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A blog writer. The featured author appears in the blog sidebar widget. */
#[Fillable(['name', 'role', 'avatar_path', 'bio', 'is_featured'])]
final class BlogAuthor extends Model
{
    /** @use HasFactory<BlogAuthorFactory> */
    use HasFactory;

    /** @return HasMany<Post, $this> */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_featured' => 'boolean'];
    }
}
