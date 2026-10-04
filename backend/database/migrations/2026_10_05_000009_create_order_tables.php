<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Orders keep a snapshot of everything at purchase time (names, prices,
 * addresses, shipping and payment labels) so later catalog edits never change
 * a placed order.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            // "KS-2026-000001"; assigned right after insert, inside the PlaceOrder transaction.
            $table->string('number', 30)->nullable()->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // Client-generated key that makes checkout retries return the same order.
            $table->string('idempotency_key', 100)->unique();
            $table->string('status', 20);
            $table->string('payment_status', 20);
            $table->string('payment_method', 30);
            $table->string('email');
            $table->char('currency', 3);
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('shipping_total');
            $table->unsignedBigInteger('total');
            $table->string('coupon_code', 50)->nullable();
            $table->string('shipping_method', 30);
            $table->string('shipping_method_name');
            $table->text('notes')->nullable();
            $table->timestamp('placed_at');
            $table->timestamps();

            // Account order history (newest first) and guest tracking by email.
            $table->index(['user_id', 'placed_at']);
            $table->index('email');
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug');
            $table->string('sku');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('line_total');
            $table->timestamps();
        });

        Schema::create('order_addresses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('company')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->char('country_code', 2);
            $table->string('country_name');
            $table->string('state')->nullable();
            $table->string('city');
            $table->string('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('postcode', 20)->nullable();
            $table->timestamps();

            $table->unique(['order_id', 'type']);
        });

        Schema::create('coupon_redemptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->unsignedBigInteger('discount_amount');
            $table->timestamps();

            $table->index('coupon_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('order_addresses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
