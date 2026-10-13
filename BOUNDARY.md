# Server and client boundaries

Use a client component only where the UI needs browser state, event handlers,
or a browser-only library. Data access, access checks, and order creation stay
on the server.

## Client components

| Component | Why it runs in the browser |
| --- | --- |
| `Providers`, `CartBadge`, `CartView` | Cart context, browser storage, and cart controls |
| `FavoriteButton`, `FavoriteDishes`, `FavoritesBadge` | Browser-local saved dishes and favorite controls |
| `CategoryBar`, `AddToCartButton` | Menu filters, search, paging, and cart updates |
| `CheckoutForm`, `SignInForm` | Pending form state and server-action feedback |
| `AccountStatus` | Refresh the displayed account after navigation |
| `OrderLive`, `OrderStatus` | Live tracking, status refresh, and cancellation |
| `MapPanel`, `DeliveryMap` | Load Leaflet without server-side `window` access |
| `RevenueChart`, `OrdersPerDayChart` | Render interactive charts |
| `TrackingPanel` | Display live delivery progress |
| `app/menu/error.js`, `app/orders/error.js` | Next.js error boundaries use client-side reset |

## Server components and server-only code

Pages and layouts render on the server by default. In particular, dish data,
session checks, staff checks, and order ownership checks remain server-side.
`app/actions.js`, `app/signin/actions.js`, and the route handlers validate
requests and perform writes on the server.

The browser receives only the data needed to render each view. Checkout sends
dish ids and quantities; the server looks up prices itself. `SESSION_SECRET`
is used only by server-side session code and must never be exposed through a
`NEXT_PUBLIC_` variable.

For the current data flow and the in-memory-store limitation, see
[DATA.md](./DATA.md). For route rendering types, see [STRATEGY.md](./STRATEGY.md).
