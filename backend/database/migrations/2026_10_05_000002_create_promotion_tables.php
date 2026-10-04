<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Home page merchandising: time-limited promotions (exclusive deal with the
 * countdown, deals of the week) and the hero banner slides.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 30);
            $table->string('title');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamps();

            // "The current promotion of type X": WHERE type = ? AND starts_at <= now AND ends_at > now.
            $table->index(['type', 'ends_at']);
        });

        Schema::create('product_promotion', function (Blueprint $table): void {
            $table->foreignId('promotion_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);

            $table->primary(['promotion_id', 'product_id']);
        });

        Schema::create('banners', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title_line_1');
            $table->string('title_line_2')->nullable();
            $table->text('body');
            $table->string('image_path');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
        Schema::dropIfExists('product_promotion');
        Schema::dropIfExists('promotions');
    }
};
