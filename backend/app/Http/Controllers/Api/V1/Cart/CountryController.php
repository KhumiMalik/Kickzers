<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Cart\CountryResource;
use App\Repositories\Reference\CountryRepository;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/** `GET /countries`: the countries (and states) the shop ships to. */
final class CountryController extends Controller
{
    public function __construct(private readonly CountryRepository $countries) {}

    public function __invoke(): AnonymousResourceCollection
    {
        return CountryResource::collection($this->countries->allWithStates());
    }
}
