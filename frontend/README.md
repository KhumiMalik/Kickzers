# Kickzers — React frontend

Storefront for **Kickzers**: a React 19 + Vite port of the Colorlib "Karma" e-commerce template (`../template`, kept untouched as a reference).
The Laravel API lives in `../backend`; the contract between them is [`../docs/api-contract.md`](../docs/api-contract.md).

Start the API first (`cd ../backend && composer run dev`, see its README), then:

```bash
npm install
npm run dev            # http://localhost:5173 (calls the API at VITE_API_URL)
npm run build          # production build in dist/
npm run lint           # ESLint (zero warnings allowed)
npm run format         # Prettier
npm test               # Vitest unit/component tests (src/**/*.test.js[x])
npm run test:e2e       # Playwright end-to-end tests (e2e/) against the real API; starts its own servers
```

### End-to-end tests

`npm run test:e2e` needs PHP and the backend's Composer dependencies, nothing else running. Playwright starts its own
stack on dedicated ports, so it never touches your development servers or MySQL database:

- the Laravel API on http://localhost:8010 — PHP's built-in server with OPcache, a throwaway SQLite database
  (`backend/database/e2e.sqlite`), queued work run inline, e-mails kept in memory and rate limits off;
- Vite on http://localhost:5180, pointing at that API.

`e2e/global-setup.js` runs `migrate:fresh --seed` before every run, so tests always start from the seeded demo data
(18 products, 9 posts, coupons `KICKZERS10` and `SAVE20`, customer `jane@example.com` / `password`). The settings live
in `e2e/support/servers.js`.

The suite uses your installed Google Chrome locally and Playwright's Chromium on CI
(`npx playwright install chromium`). `npm run test:e2e:ui` opens the interactive runner.

A Husky pre-commit hook runs ESLint and Prettier on staged files (lint-staged).

## Configuration

Copy `.env.example` to `.env.local` to override:

| Variable       | Default                        | Meaning              |
| -------------- | ------------------------------ | -------------------- |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Laravel API base URL |

Variables are validated with Zod at startup (`src/config/env.js`). The API must allow this app's origin: `FRONTEND_URL`
and `SANCTUM_STATEFUL_DOMAINS` in `backend/.env` (both default to `localhost:5173`).

## Architecture

```
src/
  app/          App (QueryClient), router (lazy pages), UI providers
  pages/        thin route components: read URL params, call query hooks, compose features
  features/     one folder per domain — catalog, products, cart, checkout, orders, account, auth,
                wishlist, reviews, comments, blog, contact, newsletter, home
                each: components/, api.js, queries.js, schemas.js, index.js (public API)
  components/
    ui/         presentational primitives (NiceSelect, Modal, Pagination, toasts…) — no data fetching
    layout/     Header, Footer, PageBanner, MainLayout
  hooks/        shared hooks (useSticky, useCountdown, useLightbox…)
  lib/          api-client, query-client, money, dates, forms, shared Zod schemas
  config/       env.js (validated env), site.js (navigation + static marketing copy)
  styles/       template SCSS (lightly patched) + app.scss
```

**Data flow:** component → `useX()` hook (`queries.js`, TanStack Query) → `api.js` (endpoint + Zod parse) →
`lib/api-client.js` (fetch, cookies, CSRF, camelCase ↔ snake_case, `ApiError`) → API.

Rules (enforced by ESLint with `eslint-plugin-boundaries`):

- features import other features **only through their `index.js`**;
- `components/ui` never imports features;
- pages contain no business logic.

Other conventions:

- **Server state** (catalog, cart, user, wishlist, orders…) lives only in TanStack Query. The only contexts are
  toasts and the quick-view modal (pure UI state).
- **Money** arrives from the API as integer minor units; `lib/money.js` formats it. The client never calculates
  totals, discounts or shipping — the cart and order endpoints return them.
- **Forms** use React Hook Form + Zod; `applyServerErrors()` maps the API's 422 errors onto fields.
- **URL state:** shop and blog filters, sorting and pagination live in the query string.

### Sessions and the guest cart

The API uses Laravel Sanctum's cookie (SPA) authentication: `lib/api-client.js` sends `credentials: 'include'`, fetches
`/sanctum/csrf-cookie` before the first write and retries once on 419. The guest cart is an httpOnly cookie the browser
never reads. The only data kept in `localStorage` is the guest wishlist (product ids), merged into the account right
after login (`WishlistSync`).

Demo data (backend seeders): coupons `KICKZERS10` (10%) and `SAVE20` ($20); customer `jane@example.com` / `password`.

## Template notes

- Bootstrap **4.1.3** CSS only (no Bootstrap JS); jQuery plugins were replaced by Swiper, a NiceSelect component,
  nouislider, yet-another-react-lightbox, and small hooks.
- The template SCSS in `src/styles/scss` is the original with small patches (image paths, two typos, a few
  `li a` selectors widened to `li > span`).
