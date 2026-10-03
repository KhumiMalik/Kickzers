<?php

declare(strict_types=1);

use App\Models\User;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/*
 * BaseRepository is exercised through a minimal concrete repository for the
 * only model that exists so far (User).
 */

/** @return BaseRepository<User> */
function userRepository(): BaseRepository
{
    return new class extends BaseRepository
    {
        protected string $model = User::class;
    };
}

it('paginates in primary key order', function (): void {
    $users = User::factory()->count(3)->create();

    $page = userRepository()->paginate(perPage: 2);

    expect($page->total())->toBe(3)
        ->and($page->lastPage())->toBe(2)
        ->and($page->getCollection()->pluck('id')->all())->toBe($users->take(2)->pluck('id')->all());
});

it('finds a model by key and returns null when it does not exist', function (): void {
    $user = User::factory()->create();

    expect(userRepository()->find($user->id)?->is($user))->toBeTrue()
        ->and(userRepository()->find(999))->toBeNull();
});

it('throws ModelNotFoundException from findOrFail for a missing key', function (): void {
    userRepository()->findOrFail(999);
})->throws(ModelNotFoundException::class);

it('creates, updates and deletes models', function (): void {
    $repository = userRepository();

    $user = $repository->create(['name' => 'Jane', 'email' => 'jane@example.com', 'password' => 'secret-password']);
    $repository->update($user, ['name' => 'Jane Doe']);

    $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Jane Doe']);

    $repository->delete($user);

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});
