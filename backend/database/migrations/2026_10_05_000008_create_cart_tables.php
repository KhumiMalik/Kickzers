<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Server-owned carts. A guest cart is found by `token` (from the karma_cart
 * cookie), a user's cart by `user_id`; each user has at most one cart.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->uuid('token')->nullable()->unique();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shipping_method', 30)->nullable();
            $table->char('destination_country', 2)->nullable();
            $table->string('destination_state')->nullable();
            $table->string('destination_postcode', 20)->nullable();
            // Changes the server made since the client last read the cart (returned once).
            $table->json('notices')->nullable();
            $table->timestamps();

            $table->foreign('destination_country')->references('code')->on('countries')->nullOnDelete();
        });

        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamps();

            $table->unique(['cart_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
