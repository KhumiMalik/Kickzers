<?php

declare(strict_types=1);

namespace App\Repositories\Content;

use App\Models\NewsletterSubscriber;
use App\Repositories\BaseRepository;

/**
 * @extends BaseRepository<NewsletterSubscriber>
 */
final class NewsletterRepository extends BaseRepository
{
    protected string $model = NewsletterSubscriber::class;

    /**
     * Adds the e-mail, or re-activates it if it had unsubscribed.
     * createOrFirst relies on the unique e-mail index, so two simultaneous
     * sign-ups of one address cannot create two rows.
     */
    public function subscribe(string $email, ?string $ipAddress): NewsletterSubscriber
    {
        $subscriber = $this->query()->createOrFirst(
            ['email' => $email],
            ['ip_address' => $ipAddress, 'subscribed_at' => now()],
        );

        if ($subscriber->unsubscribed_at !== null) {
            $subscriber->update(['unsubscribed_at' => null, 'subscribed_at' => now()]);
        }

        return $subscriber;
    }
}
