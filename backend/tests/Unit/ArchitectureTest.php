<?php

declare(strict_types=1);

use App\Exceptions\ApiException;
use App\Repositories\BaseRepository;

/*
 * Project conventions (docs/plan.md §3), checked for every current and future
 * class so a new file cannot quietly break them.
 */

arch('every file declares strict types')
    ->expect(['App', 'Database'])
    ->toUseStrictTypes();

arch('concrete classes are final')
    ->expect('App')
    ->classes()
    ->toBeFinal()
    ->ignoring([BaseRepository::class, ApiException::class, 'App\Http\Controllers\Controller']);

arch('env() is only called from configuration files')
    ->expect(['App', 'Database'])
    ->not->toUse('env');

arch('controllers do not run queries directly')
    ->expect('App\Http\Controllers')
    ->not->toUse(['Illuminate\Support\Facades\DB', 'Illuminate\Database\Eloquent\Builder']);

arch('no debugging leftovers')
    ->expect(['dd', 'dump', 'ray', 'var_dump'])
    ->not->toBeUsed();

arch()->preset()->security();
