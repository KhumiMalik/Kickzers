# Karma Shop — React frontend

React 19 + Vite port of the Colorlib **Karma** e-commerce HTML template (`../template`, kept untouched as a reference).
The Laravel API lives in `../backend`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint     # oxlint
npm test         # Vitest unit/component tests (src/**/*.test.jsx)
npm run test:e2e # Playwright end-to-end tests (e2e/); starts the dev server itself
```

The e2e suite uses your installed Google Chrome locally; on CI it uses Playwright's Chromium
(`npx playwright install chromium`). `npm run test:e2e:ui` opens Playwright's interactive runner.

## How the template was ported

- **Styles** — Bootstrap **4.1.3** CSS (no Bootstrap JS) plus the template's own SCSS, copied to `src/styles/scss` and compiled by Vite.
  The theme copy has a few small edits: image URLs point to `/img/...`, two typos are fixed, and some `li a` selectors also match `li > span` (for rows that are no longer fake links).
  Everything React-specific is in `src/styles/app.scss`.
- **Images** — `public/img` (same paths as the template). Icon fonts (Linearicons, Themify, Font Awesome 4) are in `src/assets/vendor`.
- **No jQuery.** Plugin replacements:

  | Template | React |
  |---|---|
  | Owl Carousel | Swiper (rendering Owl's `.owl-nav` / `.owl-dots` markup so theme styles apply) |
  | nice-select | `components/common/NiceSelect.jsx` (same markup, keyboard support) |
  | noUiSlider (jQuery-free) | `components/product/PriceRangeSlider.jsx` wrapping `nouislider` 15 |
  | magnific-popup | `yet-another-react-lightbox` via `hooks/useLightbox.jsx` |
  | jquery.sticky | `hooks/useSticky.js` |
  | countdown.js | `hooks/useCountdown.js` |
  | Bootstrap JS (dropdown, collapse, tabs, modal) | React state + `components/common/Modal.jsx` |
  | gmaps.js + API key | Keyless Google Maps embed |
  | ajaxchimp / contact_process.php | Mock services in `src/api` |

## Structure

```
src/
  api/          service layer — one function per future Laravel endpoint (currently mocked)
  data/         mock catalog, blog posts and static site content
  context/      Cart, Wishlist, Auth, Toast, QuickView providers
  hooks/        useAsync, useForm, useSticky, useCountdown, useLightbox, …
  components/
    layout/     Header, Footer, PageBanner, MainLayout
    common/     NiceSelect, QuantityInput, Modal, Pagination, Stars, form controls
    product/    ProductCard, QuickViewModal, filters, tabs, Deals of the Week
    home/       home page sections
    blog/       sidebar, post meta, comments
  pages/        one component per route (lazy-loaded except Home)
```

## Routes

`/` · `/shop` (filters live in the query string: `category`, `brand`, `color`, `min`, `max`, `q`, `sort`, `perPage`, `page`) ·
`/product/:slug` · `/cart` · `/checkout` · `/confirmation?order=ID` · `/login` · `/tracking` · `/blog` (`category`, `tag`, `q`, `page`) ·
`/blog/:slug` · `/contact` · `/elements`

## Connecting the Laravel API

Every function in `src/api/*.js` is commented with the endpoint it stands in for (e.g. `GET /api/products`) and returns the
shape the UI expects, including Laravel-style validation errors (`{ message, errors: { field: [..] } }` with status 422),
which `useForm` maps onto the form fields. To switch to the real backend, replace each function body with a `fetch` to
that endpoint — no component changes should be needed.

What the mocks do today:

- Cart, wishlist, logged-in user and placed orders persist in `localStorage` (`karma.*` keys).
- Coupons: `KARMA10` (10% off) and `SAVE20` ($20 off).
- Login accepts any username with a password of 6+ characters; registration always succeeds.
- Reviews and comments are kept in memory until the page reloads.
