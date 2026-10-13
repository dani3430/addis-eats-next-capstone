# Addis Eats

An Ethiopian food-ordering capstone built with Next.js App Router. Customers can
browse dishes, save browser-local favorites, build a cart, sign in, place an
order, and follow a simulated delivery. Staff have a protected revenue
dashboard, kitchen queue, order cancellation, and Excel-compatible export.
The header keeps Home, Menu, Orders, Cart, Checkout, and Favorites in one
horizontal navigation row; visitors can switch between saved light and dark
themes.

> **Demo, not a production ordering service.** Orders live in process memory,
> demo accounts are hard-coded, favorites are browser-local, and delivery
> progress is simulated. Do not use this build for real customer orders or
> claim the demo delivery time as a real delivery promise.

## Run and verify locally

Requirements: Node.js compatible with the project's Next.js version and npm.

```powershell
npm install
Copy-Item .env.example .env.local
# Edit .env.local and replace SESSION_SECRET with a random secret.
npm run build
npm run start
```

Open <http://localhost:3000>. `npm run dev` is available for development, but
the production build is the appropriate local smoke-test target.

Useful commands:

| Command         | Purpose                                       |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Start the development server                  |
| `npm run lint`  | Run ESLint                                    |
| `npm run build` | Compile, prerender, and print the route table |
| `npm run start` | Serve the most recent production build        |

### Demo accounts

These credentials are intentionally published by the sign-in demo. They are
not suitable for a deployed or real service.

| Account       | Phone        | Password      | Role     |
| ------------- | ------------ | ------------- | -------- |
| Almaz Bekele  | `0912345678` | `password123` | Customer |
| Biruk Tesfaye | `0922334455` | `password123` | Customer |
| Kitchen Staff | `0900000000` | `staffpass`   | Staff    |

The sign-in page offers buttons to select and fill each demo account.

### Optional Google sign-in

To enable Google sign-in, create an OAuth 2.0 Web application client in Google
Cloud Console and add this authorized redirect URI:

```text
http://localhost:3000/signin/google/callback
```

Put the client ID and secret in `.env.local` as `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`. For a deployed app, add the matching HTTPS callback URL
to the Google client and set both variables in the hosting provider; its host
must match `SITE_URL`. Keep the secret server-side and out of source control.
Google sign-in is optional, creates customer accounts, and does not replace
the demo accounts. Without credentials, the Google button explains that setup
is needed.

## Routes

Rendering labels below match the most recently run `npm run build` output.

| Route                                       | Build type                       | Purpose / access                                  |
| ------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| `/`                                         | Static (`○`)                     | Homepage and three specials                       |
| `/menu`                                     | Static, revalidated hourly (`○`) | Searchable, filterable menu                       |
| `/menu/[id]`                                | Static generation (`●`)          | Dish details and dish-photo social metadata       |
| `/cart`                                     | Static (`○`)                     | Browser-local cart                                |
| `/favorites`                                | Static (`○`)                     | Browser-local saved dishes                        |
| `/signin`                                   | Dynamic (`ƒ`)                    | Demo sign-in                                      |
| `/signin/google`, `/signin/google/callback` | Route handlers (`ƒ`)             | Optional Google OAuth sign-in                     |
| `/checkout`                                 | Dynamic (`ƒ`)                    | Signed-in checkout                                |
| `/orders`                                   | Dynamic (`ƒ`)                    | Signed-in user's own order history                |
| `/orders/[id]`                              | Dynamic (`ƒ`)                    | Order details; owner only                         |
| `/dashboard`                                | Dynamic (`ƒ`)                    | Staff-only revenue, order charts, customer orders |
| `/kitchen`                                  | Dynamic (`ƒ`)                    | Staff-only active order queue                     |
| `/api/dishes`, `/api/dishes/[id]`           | Route handlers (`ƒ`)             | Dish data                                         |
| `/api/session`                              | Route handler (`ƒ`)              | Current public account summary                    |
| `/api/orders`                               | Route handler (`ƒ`)              | Authenticated order creation                      |
| `/api/orders/[id]`                          | Route handler (`ƒ`)              | Owner-only order data                             |
| `/api/orders/[id]/stream`                   | Route handler (`ƒ`)              | Owner-only delivery tracking stream               |
| `/api/orders/export`                        | Route handler (`ƒ`)              | Customer's own CSV export                         |
| `/api/staff/orders/export`                  | Route handler (`ƒ`)              | Staff-only all-orders CSV export                  |
| `/robots.txt`, `/sitemap.xml`               | Static (`○`)                     | Crawler metadata                                  |

Next build symbols: `○` is static, `●` is statically generated from known
parameters, and `ƒ` is dynamic or a route handler.

## Environment

The app reads the following server-side variables:

| Variable               | Local value                               | Preview / production                                    |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `SESSION_SECRET`       | Generate a random secret for `.env.local` | Set a strong, private value for each Vercel environment |
| `SITE_URL`             | `http://localhost:3000`                   | The canonical URL for that deployment                   |
| `GOOGLE_CLIENT_ID`     | Optional Google OAuth client ID           | Optional server-side Google OAuth client ID             |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth client secret       | Optional server-side Google OAuth client secret         |

Generate a local secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local`, expose `SESSION_SECRET` with a `NEXT_PUBLIC_` prefix,
or reuse a public/demo password as a production secret. The app deliberately
fails in production when `SESSION_SECRET` is missing. `SITE_URL` is used for
absolute metadata and crawler URLs.

## Deploy and presentation readiness

This repository's documentation does **not** certify a current live deployment.
Before presenting from a deployed URL:

1. Link the Vercel project to this app directory and configure both environment
   variables for the relevant deployment environments.
2. Deploy a preview, run the checks below, then promote only the version you
   have verified.
3. In a private window, test the customer flow and staff flow on the deployed
   URL. Check browser and deployment logs.
4. Confirm the live canonical/social metadata uses the deployed `SITE_URL`.

If deployment has not been verified, follow the assessment sheet: present the
last verified version rather than deploying untested changes just before the
presentation.

For Lighthouse comparisons, audit the same route in an Incognito window and
record the LCP element along with the URL and device/network settings. If
Lighthouse warns about IndexedDB, retest in Incognito before treating the
result as a clean baseline.

### Demo checklist

- Customer: browse/search the menu, add a dish, sign in, submit checkout once,
  inspect the order history, and open its tracking view.
- Staff: open `/dashboard`, inspect charts and customer-order records, export
  the CSV, cancel a demo order (it is retained as cancelled), then open
  `/kitchen`.
- Access control: signed-out visitors are redirected from protected pages;
  a customer must not access staff pages or the staff export; a customer must
  not access another customer's order.
- Input integrity: alter a submitted item price in the browser/request and
  confirm the server uses menu prices; submit invalid order data and confirm
  validation rejects it.
- Keyboard: use Tab and Enter for controls, Escape for dismissible UI, and
  check visible focus. On mobile widths, confirm the layout remains readable.
- Check `robots.txt`, `sitemap.xml`, a missing dish URL, and social-preview
  image metadata.

### Known limitations to disclose

- Orders and checkout idempotency are held in process memory. A restart loses
  customer-created orders, and separate serverless instances do not share
  state. Use a durable database and a database-backed idempotency constraint
  before taking real orders.
- Demo users and passwords are source-code fixtures, not production identity
  management.
- Cart and favorites use browser storage. They are not synchronized to an
  account or between devices; different users of the same browser profile share
  that browser's saved state.
- Delivery status, courier position, and the **90-second end-to-end journey**
  are time-based presentation simulation, not a real kitchen workflow, GPS,
  or delivery service-level promise.
- Footer location, hours, and phone number are sample/demo details and need
  verified business information before launch.
- The app retains `src/middleware.js` as requested. Next.js 16 reports that the
  middleware convention is deprecated; the current build succeeds, but a future
  migration should be planned deliberately.

## Project guide

- [AUTH.md](./AUTH.md) — sign-in, session, authorization, and attack checks.
- [DATA.md](./DATA.md) — sources, lifetimes, and data trust boundaries.
- [STRATEGY.md](./STRATEGY.md) — route rendering and architectural choices.
- [PERF.md](./PERF.md) — historical measurements and what they do/don't prove.
- [DASHBOARD.md](./DASHBOARD.md) — staff dashboard, export, and kitchen behavior.
