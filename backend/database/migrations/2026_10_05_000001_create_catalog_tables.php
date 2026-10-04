<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalog: categories (two levels), brands, colours, products and the data
 * shown in the product page tabs (images, specifications).
 * Money columns hold integer minor units (cents).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->index()->constrained('categories')->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('colors', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('hex', 7)->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            // Explicit indexes: PostgreSQL and SQLite do not index foreign keys automatically,
            // and the shop filters on all three.
            $table->foreignId('category_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('brand_id')->index()->constrained()->restrictOnDelete();
            $table->foreignId('color_id')->index()->constrained()->restrictOnDelete();
            $table->string('name')->index();
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->text('short_description');
            $table->text('description');
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('compare_at_price')->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->string('status', 20);
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Every shop query filters on status, then sorts or ranges by one of these.
            $table->index(['status', 'price']);
            $table->index(['status', 'published_at']);
            $table->index(['status', 'position']);
        });

        Schema::create('product_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'position']);
        });

        Schema::create('product_specifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_specifications');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('colors');
        Schema::dropIfExists('brands');

        // SQLite empties a table before dropping it, and the self-referencing
        // parent_id (restrict on delete) would refuse to delete parent rows.
        Schema::withoutForeignKeyConstraints(fn () => Schema::dropIfExists('categories'));
    }
};
