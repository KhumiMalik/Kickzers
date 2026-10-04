<?php

declare(strict_types=1);

namespace App\Models\Concerns;

/**
 * Long texts are stored as paragraphs separated by blank lines; the API
 * returns them as a list so the frontend renders one <p> per item.
 */
trait SplitsParagraphs
{
    /** @return list<string> */
    protected function splitParagraphs(?string $text): array
    {
        if ($text === null || trim($text) === '') {
            return [];
        }

        $paragraphs = preg_split('/\R\s*\R/', trim($text));

        return array_values(array_filter(
            array_map(trim(...), $paragraphs === false ? [$text] : $paragraphs),
            fn (string $paragraph): bool => $paragraph !== '',
        ));
    }
}
