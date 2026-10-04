# Kickzers: implementation plan

Companion to [`api-contract.md`](api-contract.md). Status: **approved 2026-10-04**.

---

## 1. Where we are today

| Area | Current state | Gap to "production-grade" |
|---|---|---|
| Frontend | React 19 + Vite + React Router 7, JavaScript; 12 pages matching the template; type-based folders (`components/`, `pages/`, `api/`, `context/`) | Server state lives in contexts and localStorage; the client computes cart and order totals; custom `useAsync` / `useForm`; no tests; oxlint only |
| Mock API | `src/api/*.js`, 1 function per future endpoint, Laravel-style 422 errors | Becomes the contract; replaced by real calls in Phase 11 |
| Backend | Fresh Laravel 13.17 skeleton, SQLite, database queue/cache/session, `log` mailer, PHPUnit | Everything else |
| Repo | **Not a git repository** | Needed for Husky, CI and your per-phase commits (see question Q1) |

---

## 2. Frontend plan (Part A)

### 2.1 Target structure

```
frontend/
├── e2e/                         # Playwright specs + fixtures (Phase 2)
├── src/
│   ├── app/                     # App.jsx, router.jsx, providers.jsx (QueryClient, Toast, QuickView)
│   ├── pages/                   # thin route components: read URL params, compose features
│   ├── features/
│   │   ├── home/                # hero, features strip, category mosaic, product carousel, exclusive deal
│   │   ├── catalog/             # shop listing, CategorySidebar, ProductFilters, PriceRangeSlider, FilterBar
│   │   ├── products/            # ProductCard, ProductGallery, ProductSummary, ProductTabs, QuickViewModal, DealsOfTheWeek
│   │   ├── reviews/             # rating summary, review list, review form
│   │   ├── comments/            # threaded comments + form (shared by products and blog)
│   │   ├── cart/                # cart table, CouponForm, ShippingCalculator, useCart(), CartBadge
│   │   ├── checkout/            # CheckoutForm, AddressFields, OrderReview box, PaymentMethods
│   │   ├── orders/              # confirmation, tracking, order history
│   │   ├── auth/                # LoginForm, RegisterForm, useCurrentUser(), login/logout mutations
│   │   ├── account/             # account page (order history + profile)
│   │   ├── wishlist/
│   │   ├── blog/                # post list, BlogInfo, BlogSidebar, PostNavigation
│   │   ├── contact/
│   │   └── newsletter/          # footer form + blog sidebar widget
│   │   # each feature: components/, api.js, queries.js, schemas.js, index.js (public API)
│   ├── components/
│   │   ├── ui/                  # NiceSelect, Modal, Pagination, QuantityInput, Stars, Loader, form controls, Toasts
│   │   └── layout/              # Header, Footer, PageBanner, MainLayout
│   ├── hooks/                   # useSticky, useCountdown, useClickOutside, useLightbox, useDocumentTitle
│   ├── lib/
│   │   ├── api-client.js        # fetch wrapper: base URL, credentials, CSRF + 419 retry, case conversion, ApiError
│   │   ├── query-client.js      # QueryClient defaults (staleTime, retry rules: no retry on 4xx)
│   │   ├── money.js             # formatMoney(minor, currency), dollarsToMinor() for the price-filter URL
│   │   └── dates.js             # formatShortDate, formatDateTime, timeAgo
│   ├── config/env.js            # Zod-validated import.meta.env (VITE_API_URL, VITE_USE_MOCKS until Phase 11)
│   ├── mocks/                   # Phase 3 only: the current mock services, moved here, then deleted in Phase 11
│   └── styles/
```

Two additions to your list, explained:

- **`features/home` and `features/comments`.** The home sections are not catalog logic, and product comments plus blog
  comments share the same UI and API shape. Without these two features, that code would end up duplicated or in the
  wrong place.
- **`src/app/`.** It holds the router and providers, so `main.jsx` stays a 5-line bootstrap file.

### 2.2 Dependency rules (enforced by ESLint)

| From | May import |
|---|---|
| `pages/` | `features/*/index.js`, `components/*`, `hooks/`, `lib/` |
| `features/X/**` | its own files; **other features only via `features/Y/index.js`**; `components/*`, `hooks/`, `lib/`, `config/` |
| `components/layout` | `features/*/index.js` (Header needs cart count and auth, Footer needs the newsletter form), `components/ui`, `hooks/`, `lib/` |
| `components/ui` | `hooks/`, `lib/` only: **no features, no data fetching** |
| `lib/`, `config/` | each other only |

Enforcement: `eslint-plugin-boundaries` (element types, plus an `entry-point` rule that allows only `index.js`), and
`eslint-plugin-import-x` for `import-x/order` and cycle detection.

### 2.3 Data flow, per feature

```
component ──useXQuery() / useXMutation()──▶ queries.js ──▶ api.js ──▶ lib/api-client.js ──▶ Laravel
                                             (query keys,     (endpoint +     (fetch, CSRF,
                                              cache updates)   Zod parse)      ApiError)
```

- **`api.js`**: one function per endpoint. It calls `apiClient` and returns `schema.parse(response)`. If the backend
  sends the wrong shape, it fails loudly at the boundary instead of deep inside a component.
- **`queries.js`**: a query-key factory (`productKeys.list(params)`, `productKeys.detail(slug)` …) plus the hooks.
  Cart mutations write the returned cart straight into the cache (`setQueryData`), so the UI updates without
  a second request.
- **`schemas.js`**: Zod schemas for responses (with a `.transform` where the UI wants a different shape) and for forms.
- **Contexts that remain:** Toast and QuickView only. Cart, wishlist, user and orders become TanStack Query state.
- **Forms:** React Hook Form + `zodResolver` (Q2). On a 422, `applyServerErrors(error, setError)` maps
  `ApiError.errors` onto fields; non-field messages go to the form alert.
- **URL state:** shop and blog filters stay in search params. Pages read them and pass plain values to the query hooks.
- **Money:** components receive minor units and call `formatMoney`. Nothing outside `lib/money.js` divides by 100.

### 2.4 Approved behaviour changes forced by the backend

1. Login by **email** (the Laravel users table has no username).
2. Payment options come from `GET /payment-methods`: Cash on delivery and Check payments (PayPal removed).
3. "Create an account?" at checkout reveals a password field; the account is created with the order.
4. Order numbers look like `KZ-2026-000001` instead of `60235`.
5. Blog tag URLs use slugs (`?tag=technology`).
6. A new `/account` page lists order history (the template has no such page; it would reuse the confirmation styles).

Everything else (markup, classes, look) stays the same. The Phase 2 e2e tests act as the safety net.

---

## 3. Backend plan (Part B)

### 3.1 Folder structure

```
backend/app/
├── Actions/
│   ├── Auth/        RegisterUser, LoginUser, LogoutUser
│   ├── Cart/        ResolveCart, AddCartItem, UpdateCartItem, RemoveCartItem, EmptyCart,
│   │                ApplyCoupon, RemoveCoupon, SetShippingMethod, SetDestination, MergeGuestCart,
│   │                CalculateCartTotals, ReconcileCart (stock/availability notices)
│   ├── Checkout/    PlaceOrder
│   └── Orders/      GenerateOrderNumber, TrackOrder
├── DTOs/
│   ├── Cart/        CartTotals, CartLine
│   ├── Checkout/    CheckoutData, AddressData
│   └── Orders/      OrderTrackingQuery
├── Enums/           OrderStatus, PaymentStatus, PaymentMethod, CouponType, ShippingMethod,
│                    ProductStatus, AddressType, PromotionType, ProductSort
├── Exceptions/      CartException, OutOfStockException, InvalidCouponException, IdempotencyConflictException
├── Contracts/       PaymentGateway
├── Services/        MediaUrl; Payments/ CashOnDeliveryGateway, CheckPaymentGateway, PaymentGatewayRegistry
├── Http/
│   ├── Controllers/Api/V1/{Catalog,Blog,Cart,Checkout,Orders,Auth,Account,Wishlist,Reviews,Comments,Contact,Newsletter}/
│   ├── Requests/{same}/
│   ├── Resources/{same}/
│   └── Middleware/   (none expected; Sanctum's stateful middleware is configured in bootstrap/app.php)
├── Models/          + Builders/ProductBuilder, PostBuilder, CouponBuilder
├── Policies/        OrderPolicy, CartItemPolicy, CommentPolicy (parent check)
├── Repositories/
│   ├── BaseRepository.php
│   ├── Catalog/  ProductRepository, CategoryRepository, BrandRepository, ColorRepository, PromotionRepository, BannerRepository
│   ├── Blog/     PostRepository, BlogSidebarRepository
│   ├── Cart/     CartRepository
│   ├── Orders/   OrderRepository
│   ├── Content/  ReviewRepository, CommentRepository, ContactMessageRepository, NewsletterRepository
│   └── Reference/ CountryRepository
├── Events/          OrderPlaced, ContactMessageReceived
├── Listeners/       SendOrderConfirmation, NotifyAdminOfContactMessage   (queued)
├── Mail/            OrderConfirmationMail (markdown)
├── Notifications/   ContactMessageNotification
└── Providers/       AppServiceProvider (strict mode, morph map, gateway binding, rate limiters)
routes/api.php       Route::prefix('v1')->name('api.v1.')…
tests/Feature/{Catalog,Blog,Cart,Checkout,Orders,Auth,Account,Wishlist,Reviews,Comments,Contact,Newsletter}/
tests/Unit/{Actions,Enums,Builders}/
```

How a request flows:

- **Reads:** `FormRequest` → `Controller` → `Repository` → `Resource`.
- **Business logic:** `FormRequest` → `Controller` → `Action` (uses repositories, runs in a transaction) → `Resource`.

Controllers stay a few lines long.

### 3.2 Database schema

All money columns are `unsignedBigInteger` in minor units. Enum columns are `string` (portable across SQLite, MySQL
and PostgreSQL), with backed-enum casts on the model.

| Table | Columns (besides `id`, timestamps) | Indexes / constraints |
|---|---|---|
| `users` | name, email, password, remember_token | email unique (exists) |
| `categories` | parent_id → categories (null), name, slug, position | slug unique, parent_id |
| `brands` | name, slug | slug unique |
| `colors` | name, slug, hex (null) | slug unique |
| `products` | category_id, brand_id, color_id, name, slug, sku, short_description, description (text), price, compare_at_price (null), stock_quantity, status (`active`/`coming_soon`/`draft`), position, published_at | slug unique, sku unique, FKs indexed, (status, price), (status, published_at), name |
| `product_images` | product_id, path, alt, position | (product_id, position) |
| `product_specifications` | product_id, label, value, position | (product_id, position) |
| `promotions` | type (`exclusive_deal`/`deals_of_the_week`), title, starts_at, ends_at | (type, starts_at, ends_at) |
| `product_promotion` | promotion_id, product_id, position | PK (promotion_id, product_id) |
| `banners` | product_id (null), title_line_1, title_line_2, body, image_path, position, is_active | (is_active, position) |
| `reviews` | product_id, user_id (null), author_name, author_email, author_phone (null), avatar_path (null), rating (tinyint), body, is_approved | (product_id, is_approved, created_at) |
| `comments` | commentable_type, commentable_id (morph: `product`/`post`), parent_id (null), user_id (null), author_name, author_email, author_phone (null), subject (null), avatar_path (null), body, is_approved | (commentable_type, commentable_id, parent_id) |
| `blog_authors` | name, role, avatar_path, bio, is_featured | |
| `blog_categories` | name, slug, tagline (null), image_path (null), featured_position (null) | slug unique |
| `blog_tags` | name, slug | slug unique |
| `posts` | blog_author_id, title, slug, excerpt, body, quote (null), closing (null), image_path, thumbnail_path, cover_path, gallery (json), views_count, published_at | slug unique, published_at |
| `blog_category_post`, `blog_tag_post` | pivots | composite PKs |
| `carts` | token (uuid, null for user carts), user_id (null), coupon_id (null), shipping_method (null), destination_country (null), destination_state (null), destination_postcode (null), notices (json) | token unique, user_id unique |
| `cart_items` | cart_id, product_id, quantity | unique (cart_id, product_id) |
| `coupons` | code, type, value, min_subtotal (null), max_uses (null), times_used, starts_at (null), expires_at (null), is_active | code unique |
| `coupon_redemptions` | coupon_id, order_id, user_id (null), email, discount_amount | (coupon_id), order_id unique |
| `countries` | code (char 2, PK), name, position | |
| `country_states` | country_code, name | (country_code, name) unique |
| `shipping_rates` | method, country_code (null = default), price, is_available | unique (method, country_code) |
| `orders` | number, user_id (null), idempotency_key, status, payment_status, payment_method, email, currency, subtotal, discount, shipping_total, total, coupon_code (null), shipping_method, shipping_method_name, notes (null), placed_at | number unique, idempotency_key unique, (user_id, placed_at), (email, number) |
| `order_items` | order_id, product_id (null, nullOnDelete), product_name, product_slug, sku, unit_price, quantity, line_total | order_id |
| `order_addresses` | order_id, type (`billing`/`shipping`), first_name, last_name, company, phone, email, country_code, country_name, state, city, address_line_1, address_line_2, postcode | unique (order_id, type) |
| `wishlist_items` | user_id, product_id | unique (user_id, product_id) |
| `contact_messages` | name, email, subject, message, ip_address | created_at |
| `newsletter_subscribers` | email, ip_address, subscribed_at, unsubscribed_at (null) | email unique |
| Laravel defaults | sessions, cache, jobs, failed_jobs, password_reset_tokens | Sanctum's personal_access_tokens table is **not** created: the SPA uses session cookies only (Phase 4) |

Notes:

- **Rating summary** is computed with an aggregate query (`AVG`, `COUNT`, grouped by rating) on the indexed
  `reviews.product_id`. I chose this over denormalised columns that can drift; it is a single cheap query per product page.
- **Order numbers** are `KZ-{year}-{id padded to 6}`, assigned inside the PlaceOrder transaction right after insert.
  Unique, readable and sortable.
- **Images:** product, blog, banner and author images move to the backend's `public` disk (`storage/app/public`,
  served through `storage:link`). The seeder copies them from `database/seeders/assets/`. Resources return absolute
  URLs. Purely decorative template images (banner backgrounds, icons, logos, instagram strip) stay in `frontend/public`.
- **Databases:** local development uses MySQL (database `kickzers`, set in `.env`). Pest runs on in-memory SQLite
  (`phpunit.xml`), so tests are fast and never touch development data. Migrations are checked on both, including a
  full rollback (`migrate:reset`). Seeders: `ReferenceDataSeeder` (countries, shipping rates, coupons) is idempotent
  and runs everywhere; the demo catalog, blog, images and `jane@example.com` / `password` are skipped in production.
- **Static marketing copy** (navigation, features strip, footer text, contact details, home category mosaic, brand
  logos) is site configuration, not mock data, so it stays in `frontend/src/config/site.js`.

### 3.3 Cross-cutting backend decisions

- **Sanctum SPA:**
  - Middleware: `statefulApi()` in `bootstrap/app.php`.
  - Stateful domain: `SANCTUM_STATEFUL_DOMAINS=localhost:5173`.
  - CORS: `supports_credentials: true`, origin from `FRONTEND_URL`.
  - Cookies: `SESSION_DOMAIN=localhost`. Cookies are not port-specific, so `:5173` and `:8000` share them.
- **Exceptions:** `bootstrap/app.php` `withExceptions()` renders every exception on `api/*` as JSON
  `{ message, code? }`. Domain exceptions map to 409 or 422.
- **Strictness:**
  - `Model::shouldBeStrict(! app()->isProduction())`.
  - `declare(strict_types=1)` and `final` everywhere.
  - Larastan level 6, aiming to reach 8 if it stays clean.
- **Queues:** database driver. `composer run dev` runs `serve`, `queue:listen` and `pail` together (the skeleton's script).
- **Mail:** `log` mailer in development. Admin notification address from `config('shop.admin_email')`.
- **API docs:** Scramble at `/docs/api`, enabled only outside production.

---

## 4. Packages

### Frontend (npm)

| Package | Version | Why | In your list? |
|---|---|---|---|
| `@tanstack/react-query` | 5.104 | server state | ✓ |
| `zod` | 4.6 | response + form schemas | ✓ |
| `react-hook-form` | 7.89 | forms | ✓ (Q2) |
| `@hookform/resolvers` | 5.9 | connects Zod schemas to RHF | **approve** |
| `vitest` | 5.0 | unit tests | ✓ |
| `jsdom` | 30.1 | DOM for Vitest | **approve** |
| `@testing-library/react` | 16.3 | component tests | ✓ |
| `@testing-library/jest-dom`, `@testing-library/user-event` | 7.0 / 14.6 | matchers, realistic user events | **approve** |
| `@playwright/test` | 1.63 | e2e (uses your installed Chrome locally, downloaded Chromium in CI) | ✓ |
| `eslint` + `@eslint/js` | **9.39** | ESLint 10 exists, but `eslint-plugin-react` and `jsx-a11y` only support ESLint ≤ 9 so far | ✓ |
| `globals` | 17.13 | browser/node globals for flat config | **approve** |
| `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` | 7.37 / 7.1 / 6.10 | React, hooks, accessibility rules | ✓ |
| `eslint-plugin-import-x` | 4.17 | import ordering, cycles | ✓ ("import ordering") |
| `eslint-plugin-boundaries` | 7.2 | feature-boundary rules | ✓ ("feature-boundary rules") |
| `eslint-config-prettier` | 10.1 | turns off rules that conflict with Prettier | **approve** |
| `prettier` | 3.9 | formatting | ✓ |
| `husky`, `lint-staged` | 9.1 / 17.6 | pre-commit lint + format | ✓ |

**oxlint:** I recommend **removing** it. ESLint will cover everything oxlint checks, and two linters mean two
configs that can disagree. Its speed advantage doesn't matter at this project size.

### Backend (composer)

| Package | Version | Note |
|---|---|---|
| `laravel/sanctum` | 4.3 | via `php artisan install:api` |
| `dedoc/scramble` | 0.13 | OpenAPI docs |
| `laravel/boost` (dev) | 2.10 | install + follow its guidelines |
| `pestphp/pest` (dev) | **4.7** | Pest 5 requires PHP 8.4; the project targets PHP 8.3, so 4.7 is the newest compatible version (Phase 4) |
| `pestphp/pest-plugin-laravel` (dev) | 4.1 | **approve**: Laravel helpers for Pest |
| `larastan/larastan` (dev) | 3.12 | PHPStan for Laravel |
| `laravel/pint` (dev) | 1.32 | already present; I'll update it |

Exact versions are resolved by npm/composer at install time. If any package is incompatible with Laravel 13 or
React 19, I'll stop and tell you rather than downgrade silently.

---

## 5. Testing strategy

| Layer | Tool | What | When |
|---|---|---|---|
| E2E | Playwright | every flow in the spec's Phase 2 list | Phase 2 (mock), re-pointed at the real backend in Phase 11 |
| Component/unit | Vitest + RTL | api-client (CSRF retry, ApiError mapping), money, schemas, ProductCard, filters, cart, form error mapping | Phase 3 onward |
| Backend feature | Pest | each endpoint: happy path, validation, authorization, edge cases | written with each backend phase, completed in Phase 12 |
| Backend unit | Pest | Actions (totals, coupon rules, PlaceOrder, idempotency), enums, builders | same |
| Static | ESLint, Prettier, Pint, Larastan | | every phase |

E2E against the real backend (Phase 11):
- Playwright's `webServer` starts `php artisan serve` against a separate `database/e2e.sqlite` and the Vite dev server.
- `globalSetup` runs `migrate:fresh --seed`, so every run starts from the same seeded data.
- Tests that place orders use unique emails.

CI (Phase 12): GitHub Actions with two jobs, `frontend` (lint, unit, build) and `backend` (Pint, Larastan, Pest),
then an `e2e` job that needs both.

---

## 6. Phases

Each phase ends with:
- Frontend: lint, unit, e2e and build all green.
- Backend (from Phase 4): Pint, Larastan and Pest all green.
- A summary from me, a commit reminder for you, and a wait for "continue".

| # | Phase | Deliverables | Done when |
|---|---|---|---|
| 1 | Analysis + plan | `docs/api-contract.md`, `docs/plan.md` | you approve |
| 2 | Frontend safety net | Playwright config + specs for every current flow; Vitest config + one smoke test | all e2e pass on today's code |
| 3 | Frontend architecture | feature folders, `lib/api-client`, TanStack Query, Zod, RHF, ESLint/Prettier/Husky; mock services move to `src/mocks/` behind the same `api.js` functions and now own coupon/total maths | e2e pass **unchanged**; lint clean |
| 4 | Backend foundation | packages, Boost, Sanctum + CORS + CSRF, JSON exception rendering, `/api/v1`, BaseRepository, Pint/Larastan/Pest config, `composer run dev` | `GET /api/v1/health`-style smoke test passes; static checks clean |
| 5 | Database | migrations, models, relationships, enums + casts, builders, factories, seeders reproducing today's mock data | `migrate:fresh --seed` works; model/factory tests pass |
| 6 | Catalog + content (read) | home, products, filters, related, deals, blog posts/sidebar, countries, payment methods | feature tests per endpoint; no N+1 (strict mode) |
| 7 | Auth + account + wishlist | register/login/logout/user, order history endpoints (empty for now), wishlist + policies | tests incl. 401/403/429 |
| 8 | Cart + coupons + shipping | cart cookie, all cart actions, totals, coupons, shipping rates, merge on login | tests incl. stock, expired coupon, min amount |
| 9 | Checkout + orders + tracking + emails | PlaceOrder transaction, idempotency, order number, gateway contract, OrderPlaced → queued mail, tracking, confirmation access | tests incl. duplicate submission, race-safe stock |
| 10 | Reviews, comments, contact, newsletter | write endpoints + rate limits + queued contact notification | tests incl. throttling, reply rules |
| 11 | Integration | feature `api.js` files call the real API; mocks, mock data and localStorage for cart/orders/auth removed; `VITE_API_URL`; e2e against the seeded backend | full flow passes end-to-end |
| 12 | Quality + docs | remaining backend tests, Action unit tests, frontend component tests, GitHub Actions, root `README.md`, `docs/architecture.md` | everything green in CI |

---

## 7. Decisions (approved 2026-10-04: all recommendations accepted)

| # | Question | Options | My recommendation |
|---|---|---|---|
| Q1 | The project is **not a git repo**. Husky, CI and your per-phase commits need one. | (a) I run `git init` at `react/` (one repo, `template/`, `frontend/`, `backend/` inside) with a root `.gitignore`; (b) you set it up | **(a)**, before Phase 2. I won't commit; you will. |
| Q2 | Replace the custom `useForm` with React Hook Form + `zodResolver`? | yes / keep custom | **Yes.** It removes about 60 lines of hand-written state, and each form then has one Zod schema that drives its validation. |
| Q3 | Guest wishlist | (a) kept in the browser for guests, merged into the account on login; (b) login required: heart shows "Log in to save items" toast; (c) server-side guest wishlist via a cookie like the cart | **(a)**. It keeps today's behaviour for guests and costs one small endpoint (`POST /wishlist/merge`). |
| Q4 | Login identifier | (a) email (placeholder "Email Address"); (b) add a unique `username` column | **(a).** It is standard, and register already asks for an email. |
| Q5 | Payment methods (template shows "Check payments" + "PayPal") | (a) Cash on delivery only; (b) Cash on delivery + "Check payments", both offline gateways implementing the contract; (c) keep a PayPal option (needs a real integration and credentials, so out of scope) | **(b).** The checkout keeps two options like the template, and the second gateway proves the contract works. |
| Q6 | "Create an account?" at checkout | (a) when ticked, show a password field; the account is created with the order and logged in; (b) remove the checkbox | **(a).** |
| Q7 | Order history UI | (a) new `/account` page (order list + details) linked from the Pages menu when logged in, reusing template styles; (b) API only for now | **(a).** "Order history for logged-in users" needs somewhere to appear. |
| Q8 | Reviews/comments moderation | (a) publish immediately (today's behaviour), `is_approved` column ready; (b) hold for approval | **(a)** |
| Q9 | Extra packages marked **approve** in section 4, plus ESLint 9 instead of 10, and removing oxlint | approve / adjust | approve |

Accepted: Q1 (a), Q2 yes, Q3 (a), Q4 (a), Q5 (b), Q6 (a), Q7 (a), Q8 (a), Q9 approved. Anything not listed here
follows the spec as written.
