<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table): void {
            $table->id();
            // Stored upper-case; looked up case-insensitively by upper-casing the input.
            $table->string('code', 50)->unique();
            $table->string('type', 20);
            // Percent: whole percentage (10 = 10%). Fixed: minor units (2000 = $20.00).
            $table->unsignedBigInteger('value');
            $table->string('description');
            $table->unsignedBigInteger('min_subtotal')->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('times_used')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
