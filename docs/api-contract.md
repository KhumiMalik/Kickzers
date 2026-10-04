# Kickzers API contract (v1)

This is the contract between the React frontend (`frontend/`) and the Laravel API (`backend/`).
It replaces the mock services in `frontend/src/api/*.js`. The [mapping table](#11-mapping-from-the-current-mock-services)
at the end links each current mock function to its endpoint.

Status: **approved 2026-10-04**. Changes after approval are noted in the phase summaries.

Additive changes since approval (all backwards compatible):

- Phase 5: the project is named **Kickzers**; order numbers and SKUs use the `KZ-` prefix, the demo coupon is
  `KICKZERS10` and the guest cart cookie is `kickzers_cart`.
- Phase 6: promotion blocks (`exclusive_deal`, `deals_of_the_week`, `/promotions/deals-of-the-week`) always include
  `title`; post links (`previous`, `next`, sidebar `popular`) all include `published_at`; the 404 from
  `/promotions/deals-of-the-week` carries `"code": "no_active_promotion"`.
- Phase 7: `POST /wishlist/merge` validates only the shape of `product_ids`; ids of products that are unknown or no
  longer published are skipped (a stale browser wishlist must not break the login flow). Wishlist lists leave out
  saved products that have since become drafts.
- Phase 8: coupon errors (`errors.code`) are "This coupon code is not valid.", "This coupon is not valid yet.",
  "This coupon has expired.", "This coupon has reached its usage limit." and "Spend $50.00 or more to use this coupon.".
  A shipping method without any rate row is not offered. A cart item id from another cart answers
  404 "Cart item not found." (never 403, so ids of other carts are not revealed). The guest cart cookie is only read
  and set for requests from the SPA origin (Sanctum's stateful middleware decrypts it).
- Phase 9: a missing or non-UUID `Idempotency-Key` answers 400 `{ "code": "idempotency_key_missing" }`. The
  payment gateway sets the new order's status: cash on delivery → `processing`, check payments → `pending` (it ships
  once the check clears); both `unpaid`. The tracking 404 carries `"code": "order_not_found"`. Logged-in customers may
  leave `billing.email` empty (the account e-mail is used) and their `create_account` is ignored.
- Phase 10: the contact notification goes to `SHOP_ADMIN_EMAIL` (config `shop.admin_email`; §11 originally said
  `MAIL_ADMIN_ADDRESS`), with the visitor as reply-to. Rating errors say "Please choose a rating from 1 to 5."; an
  invalid `parent_id` says "You can only reply to a top-level comment on this page." (a reply, another page's comment
  and an unpublished comment are all invalid parents). Re-subscribing an unsubscribed address re-activates it.

---

## 1. Conventions

### 1.1 Base URL and versioning

| | Development | Notes |
|---|---|---|
| API base | `http://localhost:8000/api/v1` | Frontend reads it from `VITE_API_URL` |
| SPA origin | `http://localhost:5173` | Configured as a Sanctum stateful domain and CORS origin |

All endpoints below are relative to `/api/v1`, except `GET /sanctum/csrf-cookie`.
A breaking change means a new `/api/v2` prefix; additive changes (new optional fields) stay in v1.

### 1.2 Requests

- Headers on every request: `Accept: application/json`. Bodies are JSON (`Content-Type: application/json`).
- The browser sends cookies (`fetch(..., { credentials: 'include' })`).
- **Casing:** JSON keys are `snake_case` on the wire, which is Laravel's convention (also used by its paginator
  and validation errors). The frontend `api-client` converts keys to `camelCase` on responses and back to `snake_case`
  on request bodies, so React code only ever sees camelCase. Query-string parameters use the names documented here.
- **Enum values** (sort options, statuses, method codes) are lowercase strings and are not case-converted.

### 1.3 Authentication (Laravel Sanctum, SPA cookie mode)

1. Before the first state-changing request, the SPA calls `GET /sanctum/csrf-cookie` (204). Laravel sets an
   `XSRF-TOKEN` cookie.
2. Every `POST/PUT/PATCH/DELETE` sends the cookie's value in the `X-XSRF-TOKEN` header. A missing or expired token gives
   **419**; the api-client fetches a new CSRF cookie and retries the request once.
3. Login creates a normal Laravel session (`laravel_session` cookie, httpOnly). No tokens are stored in JavaScript.

"Auth" column values used below:

- **public**: no login needed (guests and users).
- **user**: requires a logged-in session; otherwise 401.
- **guest-only**: rejected with 403 if already logged in (register/login).

### 1.4 Cart identification

Guests are identified by an httpOnly, encrypted cookie `kickzers_cart` (UUID token, 30-day lifetime, `SameSite=Lax`),
set by the API the first time a cart is written. Logged-in users have one cart linked to their user id.
On login/register the guest cart is **merged** into the user's cart (quantities added, capped at stock) and the
cookie is cleared. The frontend never sees or stores the token.

### 1.5 Money

- All amounts are **integers in minor units** (cents): `"price": 15000` means $150.00.
- Responses that contain money also contain `"currency": "USD"` (ISO 4217) at the resource level.
- The frontend formats amounts with `Intl.NumberFormat` (`lib/money.js`) and **never computes** subtotals,
  discounts, shipping or totals itself; it displays the `totals` object returned by the cart and order endpoints.
- Price filters in requests (`min_price`, `max_price`) are also in minor units.

### 1.6 Dates

ISO 8601 strings in UTC, e.g. `"2026-10-03T18:19:29Z"`. The frontend formats them for display.

### 1.7 Response envelopes

Single resource:

```json
{ "data": { "...": "..." } }
```

Collection (not paginated):

```json
{ "data": [ { "...": "..." } ] }
```

Paginated collection (Laravel's standard `ResourceCollection` + `LengthAwarePaginator` output):

```json
{
  "data": [ { "...": "..." } ],
  "links": { "first": "…?page=1", "last": "…?page=2", "prev": null, "next": "…?page=2" },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 2,
    "path": "http://localhost:8000/api/v1/products",
    "per_page": 12,
    "to": 12,
    "total": 18
  }
}
```

Laravel also adds `meta.links` (an array of page links). The frontend ignores it and builds its own pagination from
`current_page`, `last_page`, `per_page` and `total`.

Actions without a resource to return (contact form, newsletter):

```json
{ "message": "Your message has been sent." }
```

### 1.8 Errors

Every error response is JSON with at least a `message`. All non-422 errors may also carry a machine-readable `code`.

| Status | When | Body |
|---|---|---|
| 401 | Not logged in on a **user** endpoint | `{ "message": "Unauthenticated." }` |
| 403 | Logged in but not allowed (policy), or **guest-only** endpoint while logged in | `{ "message": "This action is unauthorized." }` |
| 404 | Unknown route, slug, id or order number | `{ "message": "Product not found." }` (resource-specific wording) |
| 405 | Wrong HTTP method | `{ "message": "Method not allowed." }` |
| 409 | Conflict, e.g. idempotency key reused with a different cart | `{ "message": "…", "code": "idempotency_conflict" }` |
| 419 | CSRF token missing or expired | `{ "message": "CSRF token mismatch." }` |
| 422 | Validation or business-rule failure tied to input | see below |
| 429 | Rate limit hit (`Retry-After` header set) | `{ "message": "Too many attempts. Please try again in 42 seconds." }` |
| 500 | Unexpected error (details hidden outside `APP_DEBUG`) | `{ "message": "Server error." }` |
| 503 | Maintenance mode | `{ "message": "Service unavailable." }` |

**422 format** (Laravel's standard). Keys are field paths in dot notation and match the request body:

```json
{
  "message": "The billing.email field must be a valid email address. (and 1 more error)",
  "errors": {
    "billing.email": ["The billing.email field must be a valid email address."],
    "accept_terms": ["Please accept the terms & conditions."]
  }
}
```

The frontend api-client throws an `ApiError { status, message, code, errors }`, converting error keys to camelCase
(`billing.first_name` → `billing.firstName`, `accept_terms` → `acceptTerms`), so React Hook Form can call
`setError(field, …)` with the same path it uses for the input.

Business-rule failures that relate to the request as a whole use 422 with a domain key, e.g.
`{ "errors": { "cart": ["Aero Knit Running Shoe has only 2 left in stock."] } }`.

### 1.9 Rate limits

| Limiter | Applies to | Limit |
|---|---|---|
| `api` | every endpoint | 120 requests / minute per user or IP |
| `auth` | login, register | 5 / minute per email + IP |
| `checkout` | place order | 10 / minute per user or IP |
| `tracking` | order tracking | 10 / minute per IP |
| `submissions` | reviews, comments, contact, newsletter | 5 / minute and 50 / day per IP |

### 1.10 Idempotency (checkout)

`POST /checkout` requires an `Idempotency-Key` header (UUID v4, generated by the frontend once per checkout attempt and
reused on retries/double clicks).

- First request with a key: the order is placed → **201** with the order.
- Same key again, for the same cart/customer: no new order → **200** with the original order.
- Same key used with a different cart or customer: **409** `idempotency_conflict`.

---

## 2. Shared resource shapes

The examples below show every field. `?` marks fields that can be `null`.

### 2.1 Taxonomy

```jsonc
// Category (in product detail / filters)
{ "slug": "running", "name": "Running", "parent": { "slug": "men-shoes", "name": "Men's Shoes" } } // parent?
// Brand
{ "slug": "adidas", "name": "Adidas" }
// Color
{ "slug": "grey", "name": "Grey" }
```

### 2.2 ProductSummary (cards, lists, wishlist, related, deals)

```json
{
  "id": 1,
  "slug": "aero-knit-running-shoe",
  "name": "Aero Knit Running Shoe",
  "image": "http://localhost:8000/storage/products/p1.jpg",
  "price": 15000,
  "compare_at_price": 21000,
  "currency": "USD",
  "is_in_stock": true,
  "is_coming_soon": false,
  "category": { "slug": "running", "name": "Running" },
  "brand": { "slug": "adidas", "name": "Adidas" }
}
```

`compare_at_price` is the struck-through "old" price (`null` when there is none).
`is_in_stock` is false for coming-soon products and for products with no stock.

### 2.3 ProductDetail (`GET /products/{slug}`)

ProductSummary plus:

```json
{
  "sku": "KZ-0001",
  "short_description": "Built for everyday comfort…",
  "description": ["First paragraph…", "Second paragraph…"],
  "gallery": ["http://localhost:8000/storage/products/p1.jpg", "…"],
  "specifications": [{ "label": "Upper", "value": "Engineered mesh" }],
  "category": { "slug": "running", "name": "Running", "parent": { "slug": "men-shoes", "name": "Men's Shoes" } },
  "color": { "slug": "grey", "name": "Grey" },
  "max_quantity": 25,
  "rating": {
    "average": 4.0,
    "count": 3,
    "breakdown": { "5": 1, "4": 1, "3": 1, "2": 0, "1": 0 }
  },
  "comments_count": 3
}
```

`max_quantity` is the most a customer can add (current stock, capped at 99). It is used to limit the quantity stepper.
The server still validates stock on every cart change.

### 2.4 Review

```json
{ "id": 7, "author_name": "Blake Ruiz", "avatar": "http://…/review-1.png", "rating": 5, "body": "…", "created_at": "2026-02-12T17:56:00Z" }
```

`avatar` is `null` for new reviews. The UI then shows a default avatar. Emails and phone numbers are never returned.

### 2.5 Comment (product comments tab and blog comments)

```json
{
  "id": 1,
  "author_name": "Emilly Blunt",
  "avatar": "http://…/c1.jpg",
  "body": "Never say goodbye till the end comes!",
  "created_at": "2026-09-04T15:12:00Z",
  "replies": [ { "id": 2, "author_name": "…", "avatar": null, "body": "…", "created_at": "…", "replies": [] } ]
}
```

One level of replies only, like the template. Replies always have `"replies": []`.

### 2.6 PostSummary and PostDetail

```json
{
  "id": 1,
  "slug": "astronomy-binoculars-a-great-alternative",
  "title": "Astronomy Binoculars A Great Alternative",
  "excerpt": "MCSE boot camps have its supporters…",
  "image": "http://…/blog/m-blog-1.jpg",
  "thumbnail": "http://…/blog/post1.jpg",
  "author": { "name": "Mark Wiens" },
  "published_at": "2026-09-28T00:00:00Z",
  "views": 1200000,
  "comments_count": 6,
  "categories": [{ "slug": "technology", "name": "Technology" }],
  "tags": [{ "slug": "technology", "name": "Technology" }]
}
```

PostDetail adds:

```json
{
  "cover": "http://…/blog/feature-img1.jpg",
  "body": ["paragraph", "paragraph"],
  "quote": "MCSE boot camps…",
  "gallery": ["http://…/post-img1.jpg", "http://…/post-img2.jpg"],
  "closing": ["paragraph", "paragraph"],
  "previous": { "slug": "the-basics-of-buying-a-telescope", "title": "…", "thumbnail": "…" },
  "next": null
}
```

`previous` is the next-older post and `next` is the next-newer one (both `null` at the ends).

### 2.7 Cart

```json
{
  "data": {
    "items": [
      {
        "id": 12,
        "product": { "id": 5, "slug": "suede-classic-low", "name": "Suede Classic Low", "image": "http://…/p5.jpg" },
        "unit_price": 7500,
        "quantity": 2,
        "line_total": 15000,
        "max_quantity": 25
      }
    ],
    "item_count": 2,
    "coupon": { "code": "KICKZERS10", "description": "10% off" },
    "shipping_method": "flat_rate_10",
    "shipping_methods": [
      { "code": "flat_rate_5", "name": "Flat Rate", "price": 500 },
      { "code": "free", "name": "Free Shipping", "price": 0 },
      { "code": "flat_rate_10", "name": "Flat Rate", "price": 1000 },
      { "code": "local_delivery", "name": "Local Delivery", "price": 200 }
    ],
    "destination": { "country": "US", "state": "California", "postcode": "90001" },
    "totals": { "subtotal": 15000, "discount": 1500, "shipping": 1000, "total": 14500 },
    "currency": "USD",
    "notices": ["Gel Blaze Running Shoe: quantity reduced to 3 (stock changed)."]
  }
}
```

- `coupon`, `shipping_method` and the `destination` fields may be `null`.
- `shipping_methods` lists only the methods available for the current destination, with prices for that destination.
  The UI renders `"{name}: {price}"` and shows `"Free Shipping"` when the price is 0, which reproduces today's labels.
- `notices` reports changes the server made since the last read (stock dropped, a product was unpublished, or a coupon
  stopped qualifying). It is shown as toasts. The list is cleared once it has been returned.
- An empty cart returns the same shape with `items: []`, zero totals, and `shipping` 0.

### 2.8 Order

```json
{
  "data": {
    "number": "KZ-2026-000001",
    "status": "processing",
    "status_label": "Processing",
    "placed_at": "2026-10-03T18:19:29Z",
    "email": "jane@example.com",
    "billing_address": {
      "first_name": "Jane", "last_name": "Doe", "company": null, "phone": "0300 1234567", "email": "jane@example.com",
      "address_line_1": "12 Mall Road", "address_line_2": null, "city": "Lahore", "state": "Punjab",
      "postcode": "54000", "country": "PK", "country_name": "Pakistan"
    },
    "shipping_address": { "...same fields as billing, without email..." : "" },
    "items": [
      { "product_slug": "suede-classic-low", "name": "Suede Classic Low", "unit_price": 7500, "quantity": 2, "line_total": 15000 }
    ],
    "coupon_code": "KICKZERS10",
    "shipping_method": { "code": "flat_rate_10", "name": "Flat Rate", "price": 1000 },
    "payment_method": { "code": "cash_on_delivery", "name": "Cash on delivery" },
    "payment_status": "unpaid",
    "totals": { "subtotal": 60000, "discount": 6000, "shipping": 1000, "total": 55000 },
    "currency": "USD",
    "notes": null
  }
}
```

`items` hold **snapshot** names and prices from when the order was placed. `product_slug` can be `null` if the
product was later deleted.

- `OrderStatus`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.
- `PaymentStatus`: `unpaid`, `paid`, `refunded`.

**OrderSummary** (history list): `number`, `status`, `status_label`, `placed_at`, `item_count`, `totals.total`, `currency`.

**OrderTracking** (tracking page): `number`, `status`, `status_label`, `placed_at`, `item_count`, `shipping_method`,
`totals.total`, `currency`. It deliberately leaves out addresses, because tracking only needs number and email.

### 2.9 User

```json
{ "data": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "created_at": "2026-10-03T18:00:00Z" } }
```

---

## 2b. Utility

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/health` | public | 200 `{ "status": "ok" }`, a liveness check used by the e2e runner and monitoring *(added in Phase 4)* |

---

## 3. Auth

| Method | Path | Auth | Limit | Request | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/sanctum/csrf-cookie` | public | api | — | 204, sets `XSRF-TOKEN` | — |
| POST | `/auth/register` | guest-only | auth | `name` (≤255), `email` (unique), `password` (min 8, confirmed), `password_confirmation` | 201 `{ data: User }`, logged in, guest cart merged | 422, 403, 429 |
| POST | `/auth/login` | guest-only | auth | `email`, `password`, `remember` (bool, optional) | 200 `{ data: User }`, session regenerated, guest cart merged | 422 `errors.email = ["These credentials do not match our records."]`, 403, 429 |
| POST | `/auth/logout` | user | api | — | 204, session invalidated | 401 |
| GET | `/auth/user` | public | api | — | 200 `{ data: User }` | 401 when logged out (the frontend treats it as "guest") |

---

## 4. Account

| Method | Path | Auth | Request | Success | Errors |
|---|---|---|---|---|---|
| GET | `/account/orders` | user | `page`, `per_page` (≤50, default 10) | 200 paginated `OrderSummary[]`, newest first | 401 |
| GET | `/account/orders/{number}` | user (policy: owner) | — | 200 `{ data: Order }` | 401, 403 (not the owner), 404 |

---

## 5. Catalog

### 5.1 `GET /home`

Public. Returns everything the home page needs in one request.

```json
{
  "data": {
    "hero_slides": [
      { "id": 1, "title_lines": ["Nike New", "Collection!"], "body": "Lorem…", "image": "http://…/banner-img.png", "product": "ProductSummary" }
    ],
    "latest": ["ProductSummary × 8 (newest available products)"],
    "coming_soon": ["ProductSummary × ≤8"],
    "exclusive_deal": { "title": "Exclusive Hot Deal Ends Soon!", "ends_at": "2026-12-31T23:59:59Z", "products": ["ProductSummary"] },
    "deals_of_the_week": { "ends_at": "2026-10-10T23:59:59Z", "products": ["ProductSummary × ≤9"] }
  }
}
```

`exclusive_deal` and `deals_of_the_week` are `null` when there is no active promotion. The countdown uses
`exclusive_deal.ends_at`.

### 5.2 `GET /products`

Public. Paginated `ProductSummary[]`. Lists only published products (`active` and `coming_soon`).

| Param | Type | Rules | Meaning |
|---|---|---|---|
| `category` | slug | optional | Matches the category **or any of its children** |
| `brand` | slug | optional | |
| `color` | slug | optional | |
| `min_price` | int (minor units) | optional, ≥ 0 | `price >= min_price` |
| `max_price` | int (minor units) | optional, ≥ `min_price` | `price <= max_price` |
| `q` | string | optional, ≤ 100 chars | Searches name and brand name |
| `sort` | enum | `default` · `newest` · `price-asc` · `price-desc` · `name` | `default` = catalog position |
| `per_page` | int | `6` · `12` · `24` (default 12) | |
| `page` | int | ≥ 1 | Out-of-range pages return an empty `data` array with correct `meta` |

Unknown slugs return an empty list (not an error). Invalid `sort`, `per_page` or price values return **422**.

The shop URL keeps dollars (`?min=45`) for readability. The frontend converts them to minor units only when building
the API request.

### 5.3 `GET /catalog/filters`

Public. Facets with product counts over all published products.

```json
{
  "data": {
    "categories": [
      { "slug": "men-shoes", "name": "Men's Shoes", "products_count": 7,
        "children": [{ "slug": "running", "name": "Running", "products_count": 3 }] }
    ],
    "brands": [{ "slug": "adidas", "name": "Adidas", "products_count": 5 }],
    "colors": [{ "slug": "black", "name": "Black", "products_count": 3 }],
    "price_range": { "min": 4500, "max": 15000 },
    "currency": "USD"
  }
}
```

Brands and colours with zero products are omitted, and categories are not, which matches today's behaviour.

### 5.4 Product endpoints

| Method | Path | Auth | Success | Errors |
|---|---|---|---|---|
| GET | `/products/{slug}` | public | 200 `{ data: ProductDetail }` | 404 |
| GET | `/products/{slug}/related` | public | 200 `{ data: ProductSummary[] }`, up to 9, same parent category first, excludes coming-soon products | 404 |
| GET | `/promotions/deals-of-the-week` | public | 200 `{ data: { ends_at, products: ProductSummary[] } }` (shop page bottom block) | 404 if none active |

---

## 6. Reviews and comments

| Method | Path | Auth | Limit | Request | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/products/{slug}/reviews` | public | api | `page`, `per_page` (≤50, default 10) | 200 paginated `Review[]`, newest first | 404 |
| POST | `/products/{slug}/reviews` | public | submissions | `name`*, `email`*, `phone`, `rating`* (1–5), `body`* (≤2000) | 201 `{ data: Review }` | 404, 422, 429 |
| GET | `/products/{slug}/comments` | public | api | `page` (20 top-level comments per page, replies included) | 200 paginated `Comment[]`, oldest first | 404 |
| POST | `/products/{slug}/comments` | public | submissions | `name`*, `email`*, `phone`, `body`* (≤2000), `parent_id` | 201 `{ data: Comment }` | 404, 422, 429 |
| GET | `/posts/{slug}/comments` | public | api | `page` | 200 paginated `Comment[]`, oldest first | 404 |
| POST | `/posts/{slug}/comments` | public | submissions | `name`*, `email`*, `subject`, `body`* (≤2000), `parent_id` | 201 `{ data: Comment }` | 404, 422, 429 |

`*` = required. For logged-in users, `name` and `email` are optional and default to the account's values.
`parent_id` must be a **top-level** comment of the same product or post (otherwise 422 `errors.parent_id`).
New reviews and comments are published immediately. An `is_approved` column exists so moderation can be switched on
later without an API change.

---

## 7. Blog

| Method | Path | Auth | Request | Success | Errors |
|---|---|---|---|---|---|
| GET | `/posts` | public | `category` (slug), `tag` (slug), `q` (≤100), `page`, `per_page` (≤20, default 5) | 200 paginated `PostSummary[]`, newest first | 422 |
| GET | `/posts/{slug}` | public | — | 200 `{ data: PostDetail }`; increments `views` after the response is sent | 404 |
| GET | `/blog/sidebar` | public | — | 200, see below | — |

```json
{
  "data": {
    "author": { "name": "Charlie Barber", "role": "Senior blog writer", "avatar": "http://…/author.png", "bio": "…" },
    "popular": [{ "slug": "…", "title": "…", "thumbnail": "…", "published_at": "…" }],
    "categories": [{ "slug": "technology", "name": "Technology", "posts_count": 4 }],
    "tags": [{ "slug": "technology", "name": "Technology" }],
    "featured_categories": [{ "slug": "lifestyle", "name": "Social Life", "tagline": "Enjoy your social life together", "image": "…" }]
  }
}
```

`featured_categories` feeds the three cards at the top of the blog page.
The blog URL's `tag` parameter changes from the tag name (`?tag=Technology`) to its slug (`?tag=technology`).

---

## 8. Wishlist

| Method | Path | Auth | Request | Success | Errors |
|---|---|---|---|---|---|
| GET | `/wishlist` | user | — | 200 `{ data: ProductSummary[] }`, newest first | 401 |
| POST | `/wishlist` | user | `product_id`* (exists, published) | 201 `{ data: ProductSummary }`; 200 if already saved | 401, 422 |
| DELETE | `/wishlist/{productId}` | user | — | 204 (also 204 if it was not saved) | 401 |
| POST | `/wishlist/merge` | user | `product_ids`* (array of ints, ≤100) | 200 `{ data: ProductSummary[] }` | 401, 422 |

Guests keep their wishlist in the browser (product ids only). Right after login or registration the frontend calls
`/wishlist/merge` once and clears the local copy.

---

## 9. Cart, coupons and shipping

Every cart endpoint is public (guest or user) and returns the full **Cart** resource (`200 { data: Cart }`), so the
frontend replaces its cached cart with the response.

| Method | Path | Request | Errors |
|---|---|---|---|
| GET | `/cart` | — | — |
| POST | `/cart/items` | `product_id`* (exists), `quantity`* (1–99) | 422 `errors.product_id` (unpublished / coming soon), `errors.quantity` ("Only 3 left in stock.") |
| PATCH | `/cart/items/{itemId}` | `quantity`* (1–99) | 404 (not in your cart), 422 `errors.quantity` |
| DELETE | `/cart/items/{itemId}` | — | 404 |
| DELETE | `/cart` | — (removes all items and the coupon) | — |
| POST | `/cart/coupon` | `code`* | 422 `errors.code`: invalid / expired / not started / usage limit reached / "Spend $50.00 or more to use this coupon." |
| DELETE | `/cart/coupon` | — | — |
| PUT | `/cart/shipping-method` | `method`* (enum code) | 422 `errors.method` (unknown or not available for the destination) |
| PUT | `/cart/destination` | `country`* (code), `state` (must belong to country), `postcode` (≤20) | 422 |

Adding a product that is already in the cart increases its quantity. If the result exceeds stock the request fails
with 422 and the cart is unchanged.

Coupon types: `percent` (value = whole percent) and `fixed` (value = minor units, capped at the subtotal). The discount
applies to the subtotal only, not shipping. Seeded: `KICKZERS10` (10%) and `SAVE20` ($20.00).

Shipping: each method has a default price, and destination-specific rates may override it or make a method
unavailable. For example, Local Delivery is only offered when the destination country is the store's country
(`US`) or not set. If the selected method becomes unavailable after a destination change, the server switches to the
cheapest available method and adds a notice.

### `GET /countries`

Public. Used by the cart calculator and checkout selects.

```json
{ "data": [{ "code": "US", "name": "United States", "states": ["California", "Florida", "New York", "Texas"] }] }
```

### `GET /payment-methods`

Public. Lists the gateways enabled in the backend: `cash_on_delivery` and `check` (both offline, both implementing the
`PaymentGateway` contract). PayPal is not offered until a real integration exists.

```json
{
  "data": [
    { "code": "cash_on_delivery", "name": "Cash on delivery", "description": "Pay with cash when your order is delivered.", "image": null },
    { "code": "check", "name": "Check payments", "description": "Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.", "image": null }
  ]
}
```

---

## 10. Checkout and orders

### 10.1 `POST /checkout`

Public. Limiter `checkout`. Header **`Idempotency-Key`** required (UUID).

```json
{
  "billing": {
    "first_name": "Jane", "last_name": "Doe", "company": null,
    "phone": "0300 1234567", "email": "jane@example.com",
    "country": "PK", "state": "Punjab", "city": "Lahore",
    "address_line_1": "12 Mall Road", "address_line_2": null, "postcode": "54000"
  },
  "ship_to_different_address": false,
  "shipping_address": null,
  "notes": null,
  "payment_method": "cash_on_delivery",
  "create_account": false,
  "password": null,
  "accept_terms": true
}
```

| Field | Rules |
|---|---|
| `billing.first_name`, `last_name`, `address_line_1`, `city` | required, ≤255 |
| `billing.phone` | required, ≤30 |
| `billing.email` | required, email, ≤255 (for logged-in users defaults to the account email) |
| `billing.country` | required, existing country code |
| `billing.state` | optional, must belong to `country` |
| `billing.company`, `address_line_2`, `postcode` | optional |
| `ship_to_different_address` | boolean |
| `shipping_address.*` | required when `ship_to_different_address` is true; same rules as billing without phone/email |
| `notes` | optional, ≤1000 |
| `payment_method` | required, one of `GET /payment-methods` codes |
| `create_account` | boolean; ignored for logged-in users |
| `password` | required when `create_account` is true, min 8; `billing.email` must then not belong to an existing account (422 `billing.email`: "An account with this email already exists. Please log in.") |
| `accept_terms` | `accepted` ("Please accept the terms & conditions.") |

What the server does (the `PlaceOrder` action, in one DB transaction):

1. Locks the cart's product rows (`lockForUpdate`) and re-checks every line: published, in stock, quantity ≤ stock.
   It also checks that the cart's shipping method is available for the **shipping address** country
   (e.g. Local Delivery is US-only); otherwise 422 `errors.cart`. *(Added in Phase 3.)*
2. Re-validates the coupon (expiry, usage limit, minimum amount) and recalculates all totals.
3. Creates the order, order items (snapshot name, slug, SKU and unit price) and addresses.
4. Decrements stock and records the coupon redemption.
5. Calls the `PaymentGateway` for `payment_method` (cash on delivery: order `processing`, payment `unpaid`).
6. Empties the cart.
7. If `create_account` is true: creates the user, links the order to it, and logs the session in.
8. After commit, dispatches `OrderPlaced`, whose queued listener emails the confirmation.

Responses:

| Status | Meaning |
|---|---|
| 201 | `{ data: Order }`; the order is also remembered in the session so the guest can open the confirmation page |
| 200 | Idempotent replay; returns the original order |
| 409 | `idempotency_conflict` |
| 422 | Field errors, or `errors.cart` (empty cart, out of stock, product unavailable) or `errors.coupon` (coupon no longer valid). Nothing is written. |
| 429 | Rate limited |

### 10.2 Order endpoints

| Method | Path | Auth | Request | Success | Errors |
|---|---|---|---|---|---|
| GET | `/orders/{number}` | public, but authorized only for the order's owner **or** a session that placed it | — | 200 `{ data: Order }` | 403, 404 |
| POST | `/orders/track` | public, limiter `tracking` | `order_number`*, `email`* | 200 `{ data: OrderTracking }` | 404 `{ message: "No order matches that order number and billing email." }` (same message whether the number or the email is wrong), 422, 429 |

The confirmation page uses `GET /orders/{number}`. A guest who opens that link in another browser gets 403 and is
shown a link to the tracking page.

---

## 11. Contact and newsletter

| Method | Path | Auth | Limit | Request | Success | Errors |
|---|---|---|---|---|---|---|
| POST | `/contact` | public | submissions | `name`* (≤255), `email`*, `subject`* (≤255), `message`* (≤5000) | 201 `{ message: "Your message has been sent." }`. Stored, and a queued notification is emailed to `MAIL_ADMIN_ADDRESS` | 422, 429 |
| POST | `/newsletter` | public | submissions | `email`* | 202 `{ message: "Thank you for subscribing!" }`, the same response whether the email is new or already subscribed (no email enumeration) | 422, 429 |

---

## 12. Mapping from the current mock services

| Current mock (`frontend/src/api`) | Endpoint(s) | Shape changes the frontend must absorb |
|---|---|---|
| `products.getHomeData()` | `GET /home` | `coming` → `coming_soon`; `exclusive` → `exclusive_deal.products` (+ `ends_at` replaces the hard-coded date); `deals` → `deals_of_the_week.products` |
| `products.getProducts(params)` | `GET /products` | `flag: 'deal'` → `GET /promotions/deals-of-the-week`; `meta` uses Laravel names (`current_page`, `last_page`, `per_page`); prices in cents |
| `products.getProduct(slug)` | `GET /products/{slug}`, `/reviews`, `/comments` | reviews and comments move to their own endpoints; `oldPrice` → `compareAtPrice`; `inStock` → `isInStock`; `specs` → `specifications`; `category` becomes an object |
| `products.getRelatedProducts(slug)` | `GET /products/{slug}/related` | — |
| `products.getShopFilters()` | `GET /catalog/filters` | `count` → `productsCount` |
| `products.addProductReview()` / `addProductComment()` | `POST /products/{slug}/reviews` / `comments` | `text` → `body` |
| `blog.getPosts()` / `getPost()` | `GET /posts`, `GET /posts/{slug}` | `{ post, prev, next }` → one object with `previous`/`next`; comments via `GET /posts/{slug}/comments`; tags/categories become objects |
| `blog.getBlogSidebar()` | `GET /blog/sidebar` | adds `featured_categories` (was static data) |
| `blog.addPostComment()` | `POST /posts/{slug}/comments` | `text` → `body` |
| `checkout.validateCoupon()` | `POST /cart/coupon` | returns the whole cart |
| `checkout.createOrder()` | `POST /checkout` | client no longer sends items or totals; adds `Idempotency-Key` |
| `checkout.getOrder()` | `GET /orders/{number}` | order id → order `number` |
| `checkout.trackOrder()` | `POST /orders/track` | `orderId` → `orderNumber` |
| `site.login()` / `register()` | `POST /auth/login` / `register` (+ `GET /auth/user`, `POST /auth/logout`) | login by **email** instead of username |
| `site.subscribeNewsletter()` | `POST /newsletter` | — |
| `site.sendContactMessage()` | `POST /contact` | — |
| `CartContext` (localStorage) | `/cart/*` | server-owned; totals come from the API |
| `WishlistContext` (localStorage) | `/wishlist/*` | guests keep ids in the browser, merged via `POST /wishlist/merge` on login |
| `data/site.js` `countries`, `shippingMethods`, `paymentMethods`, `heroSlides`, `exclusiveDealEndsAt` | `GET /countries`, cart `shipping_methods`, `GET /payment-methods`, `GET /home` | — |
