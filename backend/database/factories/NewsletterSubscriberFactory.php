<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<NewsletterSubscriber>
 */
final class NewsletterSubscriberFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => Str::lower(fake()->unique()->safeEmail()),
            'ip_address' => fake()->ipv4(),
            'subscribed_at' => now(),
            'unsubscribed_at' => null,
        ];
    }

    public function unsubscribed(): static
    {
        return $this->state(fn (): array => ['unsubscribed_at' => now()]);
    }
}
