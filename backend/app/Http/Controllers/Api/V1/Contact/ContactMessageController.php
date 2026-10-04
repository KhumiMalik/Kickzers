<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Contact;

use App\Actions\Content\SendContactMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Contact\SendContactMessageRequest;
use Illuminate\Http\JsonResponse;

/** `POST /contact`: the contact page form (201). */
final class ContactMessageController extends Controller
{
    public function __invoke(SendContactMessageRequest $request, SendContactMessage $sendContactMessage): JsonResponse
    {
        $sendContactMessage->handle(
            name: $request->string('name')->toString(),
            email: $request->string('email')->toString(),
            subject: $request->string('subject')->toString(),
            message: $request->string('message')->toString(),
            ipAddress: $request->ip(),
        );

        return response()->json(['message' => 'Your message has been sent.'], 201);
    }
}
