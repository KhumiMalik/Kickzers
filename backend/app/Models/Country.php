<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\CountryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithoutIncrementing;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A shipping country, keyed by its ISO 3166-1 alpha-2 code ("US"). */
#[Fillable(['code', 'name', 'position'])]
#[WithoutIncrementing]
final class Country extends Model
{
    /** @use HasFactory<CountryFactory> */
    use HasFactory;

    protected $primaryKey = 'code';

    protected $keyType = 'string';

    /** @return HasMany<CountryState, $this> */
    public function states(): HasMany
    {
        return $this->hasMany(CountryState::class, 'country_code', 'code')->orderBy('name');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
