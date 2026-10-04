<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CountryStateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A state / province / district of a country (the "District" select at checkout). */
#[Fillable(['country_code', 'name'])]
final class CountryState extends Model
{
    /** @use HasFactory<CountryStateFactory> */
    use HasFactory;

    /** @return BelongsTo<Country, $this> */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_code', 'code');
    }
}
