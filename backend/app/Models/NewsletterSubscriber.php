<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\NewsletterSubscriberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** A newsletter sign-up; the email is stored lower-case and is unique. */
#[Fillable(['email', 'ip_address', 'subscribed_at', 'unsubscribed_at'])]
final class NewsletterSubscriber extends Model
{
    /** @use HasFactory<NewsletterSubscriberFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['subscribed_at' => 'datetime', 'unsubscribed_at' => 'datetime'];
    }
}
