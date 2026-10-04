<?php

declare(strict_types=1);

namespace App\Repositories\Cart;

use App\Models\Coupon;
use App\Repositories\BaseRepository;
use Illuminate\Support\Str;

/**
 * @extends BaseRepository<Coupon>
 */
final class CouponRepository extends BaseRepository
{
    protected string $model = Coupon::class;

    /** Codes are stored upper-case, so " kickzers10 " finds KICKZERS10. */
    public function findByCode(string $code): ?Coupon
    {
        return $this->query()->where('code', Str::upper(trim($code)))->first();
    }
}
