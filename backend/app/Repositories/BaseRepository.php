<?php

declare(strict_types=1);

namespace App\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Generic data access shared by every module repository.
 *
 * Repositories only read and write data. Business rules (stock checks, totals,
 * coupon validation…) live in Actions. Module repositories extend this class,
 * set $model and add module-specific queries; there is no interface per
 * repository because there is only one implementation of each.
 *
 * @template TModel of Model
 */
abstract class BaseRepository
{
    /** @var class-string<TModel> */
    protected string $model;

    /**
     * A fresh query for the repository's model.
     *
     * @return Builder<TModel>
     */
    public function query(): Builder
    {
        return $this->model::query();
    }

    /**
     * @param  list<string>  $with  relationships to eager-load
     * @return LengthAwarePaginator<int, TModel>
     */
    public function paginate(int $perPage = 15, array $with = []): LengthAwarePaginator
    {
        return $this->query()->with($with)->orderBy($this->newModel()->getKeyName())->paginate($perPage);
    }

    /**
     * @param  list<string>  $with
     * @return Collection<int, TModel>
     */
    public function all(array $with = []): Collection
    {
        return $this->query()->with($with)->orderBy($this->newModel()->getKeyName())->get();
    }

    /**
     * @param  list<string>  $with
     * @return TModel|null
     */
    public function find(int|string $id, array $with = []): ?Model
    {
        return $this->query()->with($with)->find($id);
    }

    /**
     * @param  list<string>  $with
     * @return TModel
     */
    public function findOrFail(int|string $id, array $with = []): Model
    {
        return $this->query()->with($with)->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function create(array $attributes): Model
    {
        return $this->query()->create($attributes);
    }

    /**
     * @param  TModel  $model
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function update(Model $model, array $attributes): Model
    {
        $model->update($attributes);

        return $model;
    }

    /**
     * @param  TModel  $model
     */
    public function delete(Model $model): void
    {
        $model->delete();
    }

    /**
     * @return TModel
     */
    protected function newModel(): Model
    {
        return new $this->model;
    }
}
