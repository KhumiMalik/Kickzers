<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Newsletter;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Newsletter\SubscribeRequest;
use App\Repositories\Content\NewsletterRepository;
use Illuminate\Http\JsonResponse;

/**
 * `POST /newsletter`: the footer sign-up. Always the same 202 answer, so the
 * form cannot be used to find out whether an address is subscribed.
 */
final class NewsletterSubscriptionController extends Controller
{
    public function __invoke(SubscribeRequest $request, NewsletterRepository $subscribers): JsonResponse
    {
        $subscribers->subscribe($request->email(), $request->ip());

        return response()->json(['message' => 'Thank you for subscribing!'], 202);
    }
}
