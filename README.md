# Kickzers

A complete e-commerce shop: a **React** storefront talking to a **Laravel** JSON API. Customers browse and filter
the catalog, read the blog, review products, fill a cart with coupons and shipping options, check out as a guest or
with an account, get a confirmation e-mail, track their order and see their order history.

The storefront is built on the [Colorlib "Karma"](https://colorlib.com) template (CC BY 3.0, kept as a reference in
`template/`).

| Part | Stack |
|---|---|
| `frontend/` | React 19, Vite, React Router, TanStack Query, React Hook Form + Zod, Bootstrap 4 (template styles), Vitest + Testing Library, Playwright |
| `backend/` | Laravel 13 (PHP 8.3), Sanctum (cookie sessions), MySQL or SQLite (PostgreSQL-compatible SQL), queued mail, Pest, Larastan (level 8), Pint, Scramble API docs |
| `docs/` | [API contract](docs/api-contract.md), [architecture](docs/architecture.md), [implementation plan](docs/plan.md) |

## Features

- **Catalog:** categories with sub-categories, brand, colour and price filters, search, sorting, pagination, product
  pages with gallery, specifications, star ratings, reviews and comments, related products, time-limited deals.
- **Cart:** guest carts (an httpOnly cookie) and account carts, merged on login; coupons (percent or fixed, dates,
  usage limits, minimum spend); shipping methods and prices per destination country; live stock checks with
  notices when something changed.
- **Checkout:** one transaction with row locks (no overselling, no coupon overuse), idempotent submission (a double
  click never creates two orders), optional account creation, cash on delivery or check payments behind a
  payment-gateway interface, confirmation e-mail sent from a queue.
- **Accounts:** register, log in by e-mail, order history, wishlist (kept in the browser for guests and merged on login).
- **Content:** blog with categories, tags, search and comments; contact form (stored and e-mailed to the shop);
  newsletter sign-up.
- **Security:** CSRF-protected cookie sessions, rate limits on logins, checkout, tracking and forms, responses that
  never reveal whether an e-mail or order number exists, customer contact details never exposed by the API.

## Getting started

Requirements: PHP 8.3 with `intl`, `pdo_mysql` and `pdo_sqlite`; Composer 2; Node.js 24 (CI uses the version in
`frontend/.nvmrc`; use the same one so `package-lock.json` stays compatible); MySQL 8 (or SQLite).

### 1. API

```bash
cd backend
composer install
cp .env.example .env          # set DB_DATABASE / DB_USERNAME / DB_PASSWORD for your MySQL
php artisan key:generate
php artisan migrate --seed    # tables plus the demo catalog, blog and customer
php artisan storage:link      # serves product and blog images from storage/app/public
composer run dev              # API on http://localhost:8000, plus the queue worker and log viewer
```

For SQLite instead of MySQL, set `DB_CONNECTION=sqlite` and remove the other `DB_*` lines.
API documentation (Scramble) is at http://localhost:8000/docs/api outside production.

### 2. Storefront

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

The defaults already point the two at each other (`VITE_API_URL` in the frontend, `FRONTEND_URL` and
`SANCTUM_STATEFUL_DOMAINS` in the backend).

### Demo data

| What | Value |
|---|---|
| Customer | `jane@example.com` / `password` |
| Coupons | `KICKZERS10` (10% off), `SAVE20` ($20 off) |
| Reset everything | `php artisan migrate:fresh --seed` |

E-mails go to `backend/storage/logs/laravel.log` in development (`MAIL_MAILER=log`). Contact-form messages are sent
to `SHOP_ADMIN_EMAIL`.

## Checks

| | Command | What |
|---|---|---|
| Backend | `composer run lint` | Pint code style |
| | `composer run analyse` | Larastan, level 8 |
| | `php artisan test` | Pest: feature, action and architecture tests on in-memory SQLite |
| Frontend | `npm run lint` / `npm run format:check` | ESLint (incl. feature-boundary rules) / Prettier |
| | `npm test` | Vitest unit and component tests |
| | `npm run build` | production build |
| | `npm run test:e2e` | Playwright against the real API (starts its own servers and a throwaway SQLite database) |

A pre-commit hook formats and lints staged files. GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
runs the frontend and backend checks in parallel, then the end-to-end tests.

## Project layout

```
backend/    Laravel API (/api/v1): Actions, Repositories, Requests, Resources, DTOs, Models, tests/
frontend/   React storefront: src/features/* (one folder per domain), src/pages, src/lib, e2e/
docs/       API contract, architecture, plan
template/   the original HTML template, untouched
```

[`docs/architecture.md`](docs/architecture.md) explains how the pieces fit together and why.

## Credits

Storefront design: the "Karma" template by [Colorlib](https://colorlib.com), licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/); the footer keeps the required credit. Demo photos come
with the template.
