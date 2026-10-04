<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table): void {
            // ISO 3166-1 alpha-2 code as the key: it is what the API sends and stores.
            $table->char('code', 2)->primary();
            $table->string('name');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('country_states', function (Blueprint $table): void {
            $table->id();
            $table->char('country_code', 2);
            $table->string('name');
            $table->timestamps();

            $table->foreign('country_code')->references('code')->on('countries')->cascadeOnDelete();
            $table->unique(['country_code', 'name']);
        });

        Schema::create('shipping_rates', function (Blueprint $table): void {
            $table->id();
            $table->string('method', 30);
            // NULL = default price for every country; a row with a country overrides it.
            $table->char('country_code', 2)->nullable();
            $table->unsignedBigInteger('price');
            $table->timestamps();

            $table->foreign('country_code')->references('code')->on('countries')->cascadeOnDelete();
            $table->index(['method', 'country_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
        Schema::dropIfExists('country_states');
        Schema::dropIfExists('countries');
    }
};
