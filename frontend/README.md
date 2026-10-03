# Karma Shop — React frontend

React 19 + Vite port of the Colorlib **Karma** e-commerce template (`../template`, kept untouched as a reference).
The Laravel API lives in `../backend`; the contract between them is [`../docs/api-contract.md`](../docs/api-contract.md).

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
npm run lint           # ESLint (zero warnings allowed)
npm run format         # Prettier
npm test               # Vitest unit/component tests (src/**/*.test.js[x])
npm run test:e2e       # Playwright end-to-end tests (e2e/); starts the dev server itself
```

The e2e suite uses your installed Google Chrome locally and Playwright's Chromium on CI
(`npx playwright install chromium`). `npm run test:e2e:ui` opens the interactive runner.

A Husky pre-commit hook runs ESLint and Prettier on staged files (lint-staged).

## Configuration

Copy `.env.example` to `.env.local` to override:

| Variable         | Default                        | Meaning                                                 |
| ---------------- | ------------------------------ | ------------------------------------------------------- |
| `VITE_API_URL`   | `http://localhost:8000/api/v1` | Laravel API base URL                                    |
| `VITE_USE_MOCKS` | `true`                         | `true`: answer requests with the in-browser mock server |

Variables are validated with Zod at startup (`src/config/env.js`).

## Architecture

```
src/
  app/          App (QueryClient), router (lazy pages), UI providers
  pages/        thin route components: read URL params, call query hooks, compose features
  features/     one folder per domain — catalog, products, cart, checkout, orders, auth,
                wishlist, reviews, comments, blog, contact, newsletter, home
                each: components/, api.js, queries.js, schemas.js, index.js (public API)
  components/
    ui/         presentational primitives (NiceSelect, Modal, Pagination, toasts…) — no data fetching
    layout/     Header, Footer, PageBanner, MainLayout
  hooks/        shared hooks (useSticky, useCountdown, useLightbox…)
  lib/          api-client, query-client, money, dates, forms, shared Zod schemas
  config/       env.js (validated env), site.js (navigation + static marketing copy)
  mocks/        in-browser mock of the Laravel API (removed in Phase 11)
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

### Mock server

Until the Laravel API is connected, `VITE_USE_MOCKS=true` routes every request to `src/mocks/server.js`, which
answers in exactly the contract's wire format (snake_case, minor units, `{ data }` envelopes, 401/404/422 errors) and
implements the server-side rules (totals, coupons, stock, shipping by destination, idempotent checkout, sessions).
Its state is kept in `localStorage` (`karma.mock-server.v1`) so reloads behave like a real server.

Demo data: coupons `KARMA10` (10%) and `SAVE20` ($20); login accepts any username with a 6+ character password.

## Template notes

- Bootstrap **4.1.3** CSS only (no Bootstrap JS); jQuery plugins were replaced by Swiper, a NiceSelect component,
  nouislider, yet-another-react-lightbox, and small hooks.
- The template SCSS in `src/styles/scss` is the original with small patches (image paths, two typos, a few
  `li a` selectors widened to `li > span`).
