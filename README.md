# Sori · ثوری

Persian, RTL cookie storefront built with Angular 22.2 and Angular Material 22.2. Prices are whole **Toman** (`IRT`) throughout; no rial conversion is applied.

## Run

```sh
pnpm install
pnpm start
```

Open `http://localhost:4200`. Run the CookieShop .NET API at `http://localhost:5265`. The frontend origin must match the API CORS configuration; use `localhost`, not `127.0.0.1`.

```sh
pnpm openapi     # regenerate src/api from the running API
pnpm build      # production browser and Node server bundles
pnpm test       # Playwright desktop/mobile browser tests (installed Chrome required)
```

The browser tests read the live sample catalog. Authenticated cart, address, checkout, and cancellation tests use intercepted responses and do not mutate store data. The suite includes axe WCAG A/AA scans and horizontal overflow checks. Screenshots and traces appear in ignored `test-results/`.

## UI

Angular Material supplies the toolbar, buttons, locally hosted SVG icons, badges, product/order cards, category chips, search and signal-form fields, account tabs, Persian paginator, delivery radio buttons, loading indicators, snackbars, and cancellation dialog. The UI uses the unmodified, prebuilt Material 3 Azure/Blue theme and Material system typography utilities. Application CSS only handles layout and responsive placement; there are no component theme overrides, custom control styles, or Material token assignments. The cancellation dialog manages focus and restores it when closed.

## Pages

- `/`: brand storefront and featured products
- `/shop`: search, categories, and paginated products
- `/shop/:id`: product details, availability, and image gallery
- `/account`: registration, login, logout, and account links
- `/cart`: server cart and quantity controls
- `/checkout`: saved/new delivery addresses and order submission
- `/orders`: order history, details, and pending-order cancellation
- `/about`: Sori’s story

The old components, services, guards, and admin panel were removed as requested. This implementation is the customer storefront; it does not include an owner dashboard.

## API and deployment

`src/app/shop/config.ts` defines the API origin. Set it to the deployed API origin before a production build. `src/app/shop/money.ts` resolves relative API image URLs against the same origin. Update the OpenAPI input in `openapi.config.ts` when generating against another environment.

Authentication uses the API’s HttpOnly cookie. Every mutation fetches/sends `X-CSRF-TOKEN`; tokens are refreshed after authentication changes. No authentication credentials are stored in browser storage. Serve the API and storefront over HTTPS on the same site, matching the backend’s cookie and CORS settings.

Checkout creates a pending order and reserves stock. **There is no payment gateway in the backend.** The UI explicitly says that creating an order is not payment. Payment, recovery, and verification capabilities require backend support.

The compiler currently requires a pnpm override for `@angular/compiler-cli > @jridgewell/sourcemap-codec` to version 1.6+: Angular 22.2.3 imports `encodeRangeMappings`, but its broad dependency range can retain an older incompatible version.

## Assets

The homepage atmospheric cookie image was AI generated for this storefront; inventory images and descriptions come from the API. The cookie illustration is a fallback for missing product media.
