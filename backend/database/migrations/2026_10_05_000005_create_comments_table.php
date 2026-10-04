<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Comments on products ("Comments" tab) and blog posts, one table for both
 * (polymorphic `commentable`: "product" or "post"), with one level of replies.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table): void {
            $table->id();
            $table->string('commentable_type', 30);
            $table->unsignedBigInteger('commentable_id');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_phone', 30)->nullable();
            $table->string('subject')->nullable();
            $table->string('avatar_path')->nullable();
            $table->text('body');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            // Threads of one product/post: WHERE type = ? AND id = ? AND parent_id IS NULL.
            $table->index(['commentable_type', 'commentable_id', 'parent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
