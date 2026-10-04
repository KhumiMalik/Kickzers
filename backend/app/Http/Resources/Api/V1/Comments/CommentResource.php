<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1\Comments;

use App\Models\Comment;
use App\Services\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A comment with its replies (contract §2.5). Replies are one level deep, so
 * a reply is rendered with `"replies": []` and never loads further.
 *
 * @property-read Comment $resource
 */
final class CommentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $comment = $this->resource;

        return [
            'id' => $comment->id,
            'author_name' => $comment->author_name,
            'avatar' => MediaUrl::for($comment->avatar_path),
            'body' => $comment->body,
            'created_at' => $comment->created_at?->toIso8601ZuluString(),
            'replies' => $comment->parent_id === null
                ? self::collection($comment->approvedReplies)
                : [],
        ];
    }
}
