# Kickzers: architecture

How the storefront and the API fit together, and why they are built this way. The exact request and response
shapes are in the [API contract](api-contract.md); this document is about structure and decisions.

```
 Browser ──────────────── React storefront (Vite, :5173)
    │  fetch, credentials: include          │ TanStack Query cache
    ▼                                        │ (catalog, cart, user, wishlist, orders)
 Laravel API (/api/v1, :8000) ◄─────────────┘
    │  Sanctum session cookie + CSRF, kickzers_cart cookie for guests
    ├── MySQL / PostgreSQL / SQLite   catalog, carts, orders, content
    ├── storage/app/public            product and blog images (served as /storage/...)
    └── database queue ──► mail       order confirmation, contact notification
```

## 1. Frontend (`frontend/src`)

```
app/         QueryClient, router (lazy pages), providers
pages/       one thin component per route: reads URL params, composes features
features/    catalog, products, cart, checkout, orders, account, auth, wishlist,
             reviews, comments, blog, contact, newsletter, home
             each: components/ · api.js · queries.js · schemas.js · index.js (public API)
components/  ui/ (presentational primitives) · layout/ (header, footer, banners)
lib/         api-client, query-client, money, dates, forms, shared Zod schemas
config/      env.js (validated VITE_* vars), site.js (navigation and static copy)
```

**Data flow.** A component calls a hook from its feature's `queries.js` (TanStack Query). The hook calls `api.js`,
which sends the request through `lib/api-client.js` and parses the answer with a Zod schema. The api-client:

- sends cookies (`credentials: 'include'`) and fetches Sanctum's CSRF cookie before the first write, retrying once on 419;
- converts keys between the API's `snake_case` and the app's `camelCase`;
- turns every failed response into an `ApiError { status, message, code, errors }`.

**Rules enforced by ESLint** (`eslint-plugin-boundaries`): features import each other only through their `index.js`,
`components/ui` never imports features, and `lib` and `config` never import UI code. By convention all requests go
through `lib/api-client.js`.

**State.** Server data lives only in the TanStack Query cache; mutations replace or invalidate it (every cart endpoint
returns the whole cart, so the cart cache is simply replaced). The only React contexts are UI state (toasts, the
quick-view modal). Shop and blog filters, sorting and pagination live in the URL. The only `localStorage` data is the
guest wishlist.

**Money** arrives as integer cents and is only formatted (`lib/money.js`). The browser never computes totals,
discounts or shipping: it shows what the API returns, so the price a customer sees is the price they pay.

**Forms** use React Hook Form with Zod schemas whose messages match the API's. `applyServerErrors()` puts a 422
response's errors under the matching inputs, and anything else in the form's alert.

## 2. Backend (`backend/app`)

Every request follows one of two paths:

```
Reads:          FormRequest ─► Controller ─► Repository ─► API Resource
Business logic: FormRequest ─► Controller ─► Action (transaction) ─► API Resource
```

| Layer | Job |
|---|---|
| `Http/Requests` | validation, normalising input (lower-case e-mails, upper-case codes), building DTOs |
| `Http/Controllers/Api/V1` | a few lines: resolve, call, return a resource. They never query the database (architecture test) |
| `Actions` | one business operation each: `AddCartItem`, `ApplyCoupon`, `ReconcileCart`, `PlaceOrder`, `MergeGuestCart`… |
| `Repositories` | all queries, built on `BaseRepository` and the custom Eloquent builders (`ProductBuilder`, `PostBuilder`) |
| `Http/Resources` | the JSON shapes of the contract: absolute image URLs, ISO dates in UTC, money in cents |
| `DTOs` | read-only objects passed between layers (`CheckoutData`, `CartTotals`, `RatingSummary`…) |
| `Exceptions` | `ApiException` subclasses that render themselves; rule failures render as 422 on a field |
| `Services` | cross-cutting helpers: `CartResolver` (which cart is this request's), payment gateways, `MediaUrl`, `Money` |

**Conventions**, most of them checked by tests in `tests/Unit/ArchitectureTest.php`:

- `declare(strict_types=1)` everywhere; concrete classes are `final`; DTOs are `readonly`.
- Actions, repositories and DTOs never touch `Request`, so they can be reused by queues, commands and tests.
- `Model::shouldBeStrict()` outside production: lazy loading (N+1), missing attributes and silently discarded
  attributes throw. Endpoint tests also compare query counts for few and many rows.
- Money is `unsignedBigInteger` cents; enums are string columns with backed-enum casts; polymorphic comments store
  `product` / `post` (enforced morph map), not class names.
- Migrations and queries avoid database-specific SQL (no HAVING on aliases, explicit foreign-key indexes, ordered
  migration timestamps) so they can run on MySQL, PostgreSQL and SQLite. They are exercised on MySQL (development)
  and SQLite (tests, e2e); PostgreSQL has not been run yet.

## 3. Sessions, carts and accounts

- **Authentication** is Sanctum's SPA mode: an httpOnly `laravel_session` cookie, no tokens in JavaScript, CSRF via the
  `XSRF-TOKEN` cookie. Login regenerates the session id; logout invalidates it.
- **Guest carts** are rows found by a random UUID in the encrypted, httpOnly `kickzers_cart` cookie, which is created
  on the first write (reading an empty cart writes nothing). On login or registration `MergeGuestCart` adds the guest
  cart to the account's cart (quantities capped at stock, the account's coupon wins) and clears the cookie.
- **Item ids are looked up inside the visitor's own cart**, so another cart's id is simply "not found" (404), never a
  403 that confirms it exists.
- **The guest wishlist** stays in the browser and is sent once to `POST /wishlist/merge` after login; unknown ids are
  skipped instead of failing the login flow.

## 4. Cart and checkout

**Every cart response is reconciled first** (`SummarizeCart` → `ReconcileCart` → `CalculateCartTotals`). Products
that can no longer be bought are removed, quantities above stock are lowered, a shipping method the destination
cannot use is replaced by the cheapest one, and a coupon that stopped qualifying is removed. Each change is stored as a
notice and shown once.

**Shipping** comes from `QuoteShippingOptions`: a default rate per method, optionally overridden per country; a method
without a rate is off; Local Delivery only for the store's country (`config('shop.store_country')`).

**Totals** are integer arithmetic only. Percentage discounts round half up to the cent (`intdiv(x + 50, 100)`), fixed
discounts are capped at the subtotal, discounts never apply to shipping.

**`PlaceOrder` is one transaction:**

1. Lock the cart row, the product rows (in id order, so two checkouts cannot deadlock) and the coupon row
   (`SELECT … FOR UPDATE`).
2. Re-check every line against the locked stock, the shipping method against the *shipping* country, and the coupon.
3. Write the order with snapshots (names, SKUs, prices, addresses, labels), so later catalog edits never change it.
   The number `KZ-{year}-{id}` is assigned right after the insert.
4. Decrement stock, record the coupon redemption, let the payment gateway set the statuses, empty the cart.
5. Dispatch `OrderPlaced`, which implements `ShouldDispatchAfterCommit`: a rolled-back checkout never e-mails anyone.

Any failure rolls everything back and answers 422 (`errors.cart` / `errors.coupon`).

**Idempotency.** The frontend sends a UUID `Idempotency-Key` per checkout attempt. A key that already placed an order
returns that order (200) for the same customer and 409 for anyone else. Two truly simultaneous requests are separated
by the unique index on `orders.idempotency_key`: the loser catches the violation and returns the winner's order.

**Payment gateways** implement `App\Contracts\PaymentGateway` and are registered in `AppServiceProvider`. The checkout
lists and validates against the registry, so adding a gateway needs no controller or frontend change.

**Order access.** The confirmation page opens for the browser session that placed the order or for the account that
owns it (`OrderPolicy`). Anyone else is sent to tracking, which needs the order number *and* the billing e-mail,
returns the same 404 whichever is wrong, and never shows addresses.

## 5. Background work and e-mail

`OrderPlaced` → `SendOrderConfirmation` and `ContactMessageReceived` → `NotifyAdminOfContactMessage` are queued
listeners (database queue, 3 tries with a minute between them). The request never waits for the mail server, and a
mail outage loses nothing: the order or message is already saved. `composer run dev` starts a worker; production runs
`php artisan queue:work` under a process manager.

## 6. Abuse protection

| Limiter | Applies to | Limit |
|---|---|---|
| `api` | everything | 120 / minute per user or IP |
| `auth` | login, register | 5 / minute per e-mail + IP (one locked e-mail does not block the network) |
| `checkout` | place order | 10 / minute |
| `tracking` | order tracking | 10 / minute per IP |
| `submissions` | reviews, comments, contact, newsletter | 5 / minute and 50 / day per IP |

Responses never reveal whether an e-mail has an account (login), is subscribed (newsletter) or owns an order
(tracking). Reviewer and commenter e-mails and phone numbers are stored but hidden from the API.

## 7. Testing

| Suite | Where | What |
|---|---|---|
| Pest feature tests | `backend/tests/Feature/*` | every endpoint: happy path, validation, authorization, limits, query counts |
| Pest action tests | `backend/tests/Feature/Actions` | totals, coupon rules, shipping quotes, reconciliation, order numbers (with the database, so outside `Unit`) |
| Architecture tests | `backend/tests/Unit/ArchitectureTest.php` | the conventions above |
| Vitest + Testing Library | `frontend/src/**/*.test.js(x)` | api-client, forms, schemas, URL filters, product card, coupon form, category sidebar. `src/test/api.js` fakes `fetch` in the API's wire format |
| Playwright | `frontend/e2e` | the customer journeys against the real API |

Pest runs on in-memory SQLite, so it is fast and never touches development data. Playwright starts its own stack on
ports 8010 (API) and 5180 (Vite): PHP's built-in server with OPcache, a throwaway `database/e2e.sqlite` reseeded before
every run, queued work run inline, e-mails in memory and rate limits off (`SHOP_RATE_LIMITING=false`, the only place
they are). CI runs the same suites ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).
