<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('author_name');
            $table->string('author_email');
            $table->string('author_phone', 30)->nullable();
            $table->string('avatar_path')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('body');
            // Published immediately for now; the column lets moderation be switched on later.
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            // Product page: approved reviews of one product, newest first, and the rating aggregate.
            $table->index(['product_id', 'is_approved', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
