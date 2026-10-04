<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Concerns;

use App\DTOs\Content\AuthorData;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * For review and comment forms: logged-in customers may leave name and
 * e-mail empty, the account's values are used (contract §6). Call
 * fillAuthorFromAccount() from prepareForValidation().
 *
 * @mixin FormRequest
 */
trait IdentifiesAuthor
{
    /**
     * @return array<string, list<string>>
     */
    protected function authorRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }

    protected function fillAuthorFromAccount(): void
    {
        $user = $this->user();
        $name = is_string($this->input('name')) ? trim($this->input('name')) : '';
        $email = is_string($this->input('email')) ? trim($this->input('email')) : '';

        if ($user instanceof User) {
            $name = $name !== '' ? $name : $user->name;
            $email = $email !== '' ? $email : $user->email;
        }

        $this->merge(['name' => $name, 'email' => Str::lower($email)]);
    }

    public function author(): AuthorData
    {
        $user = $this->user();

        return new AuthorData(
            name: $this->string('name')->toString(),
            email: $this->string('email')->toString(),
            phone: $this->string('phone')->trim()->toString() ?: null,
            userId: $user instanceof User ? $user->id : null,
        );
    }
}
