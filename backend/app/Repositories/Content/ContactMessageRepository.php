<?php

declare(strict_types=1);

namespace App\Repositories\Content;

use App\Models\ContactMessage;
use App\Repositories\BaseRepository;

/**
 * @extends BaseRepository<ContactMessage>
 */
final class ContactMessageRepository extends BaseRepository
{
    protected string $model = ContactMessage::class;
}
