<?php

declare(strict_types=1);

use App\Exceptions\ApiException;
use App\Exceptions\ApiExceptionRenderer;
use App\Repositories\BaseRepository;
use App\Repositories\Blog\BlogSidebarRepository;

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

arch('actions, repositories and DTOs never depend on the HTTP layer')
    ->expect(['App\Actions', 'App\Repositories', 'App\DTOs'])
    ->not->toUse(['Illuminate\Http\Request', 'App\Http']);

arch('DTOs are immutable')
    ->expect('App\DTOs')
    ->classes()
    ->toBeReadonly();

arch('repositories extend BaseRepository (except the multi-model sidebar reader)')
    ->expect('App\Repositories')
    ->classes()
    ->toExtend(BaseRepository::class)
    ->ignoring([BaseRepository::class, BlogSidebarRepository::class]);

arch('domain exceptions render as JSON through ApiException')
    ->expect('App\Exceptions')
    ->classes()
    ->toExtend(ApiException::class)
    ->ignoring([ApiException::class, ApiExceptionRenderer::class]);

arch('controllers are only used by routes')
    ->expect('App\Http\Controllers')
    ->toOnlyBeUsedIn(['App\Http\Controllers']);
