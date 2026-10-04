<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_authors', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->string('avatar_path')->nullable();
            $table->text('bio')->nullable();
            // The author shown in the blog sidebar widget.
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        Schema::create('blog_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            // The three cards above the blog list ("Social Life", "Politics", "Food").
            $table->string('featured_title')->nullable();
            $table->string('featured_tagline')->nullable();
            $table->string('featured_image_path')->nullable();
            $table->unsignedTinyInteger('featured_position')->nullable();
            $table->timestamps();
        });

        Schema::create('blog_tags', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blog_author_id')->index()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            // Paragraphs separated by blank lines.
            $table->text('body');
            $table->text('quote')->nullable();
            $table->text('closing')->nullable();
            $table->string('image_path');
            $table->string('thumbnail_path');
            $table->string('cover_path');
            $table->json('gallery')->nullable();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('blog_category_post', function (Blueprint $table): void {
            $table->foreignId('blog_category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();

            $table->primary(['blog_category_id', 'post_id']);
            $table->index('post_id');
        });

        Schema::create('blog_tag_post', function (Blueprint $table): void {
            $table->foreignId('blog_tag_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();

            $table->primary(['blog_tag_id', 'post_id']);
            $table->index('post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_tag_post');
        Schema::dropIfExists('blog_category_post');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('blog_tags');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('blog_authors');
    }
};
