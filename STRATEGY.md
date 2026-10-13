# Rendering and architecture strategy

The route types here match the latest local `npm run build` output. Run that
command after route changes; this table is not a substitute for the build
output from a deployed commit.

| Route | Build output | Why |
| --- | --- | --- |
| `/`, `/cart`, `/favorites` | `○` static | Public HTML shell; cart/favorites load from browser storage after hydration |
| `/menu` | `○` static, revalidated hourly | Stable menu shell; interactive search/filter/paging fetch data in the client |
| `/menu/[id]` | `●` static generation | Dish ids are known at build time |
| `/signin`, `/checkout`, `/orders`, `/orders/[id]` | `ƒ` dynamic | Session, submitted form, ownership, or live order state is request-specific |
| `/dashboard`, `/kitchen` | `ƒ` dynamic | Staff session and role are checked on the server |
| `/api/**` | `ƒ` route handlers | Request-specific data, authorization, or live event stream |
| `/robots.txt`, `/sitemap.xml` | `○` static metadata routes | Generated from site metadata |

`○` is static, `●` is statically generated from known parameters, and `ƒ` is
dynamic or a route handler. No generated Open Graph image route is used:
metadata points to existing dish photos.

## Important boundaries

- **Server-first access control:** pages and sensitive server actions check
  `getSession()`. Staff tools additionally require `role === "staff"`. A
  client-side hidden link is not authorization.
- **Middleware is only a redirect aid:** `src/middleware.js` redirects when
  protected page requests lack a cookie. It does not validate a token, grant a
  role, or cover API routes. Server checks remain mandatory.
- **Server is authoritative for checkout:** the client sends ids and
  quantities; the server validates them, looks up current dish prices, and
  calculates the order total.
- **Customer and staff data are separated:** customer order queries are scoped
  to the signed-in id. Staff-only pages use a separate projection to show
  customer and delivery details.
- **Static browser state:** cart and favorites do not require server rendering
  or an account API. The tradeoff is that browser profiles share the same
  stored values, and data does not follow a user between devices.
- **Interactive islands:** `Providers`, menu filters, forms, charts, map, and
  live tracking are client components where browser APIs or event handlers are
  needed. Data loading, role checks, and order totals remain on the server.
- **Explicit tradeoff:** order storage and idempotency are in process memory.
  This simplifies the capstone, but it is not reliable on a multi-instance or
  serverless deployment.

## Render strategy is not data durability

Static rendering describes how a page is produced; it does not make the
browser's cart/favorites account-specific. Dynamic rendering allows request
checks; it does not make the in-memory order store durable. Before taking real
orders, replace the store with shared persistent storage, preserve the server
authorization rules, and make idempotency transactional.

See [DATA.md](./DATA.md) for lifecycle and trust boundaries and [AUTH.md](./AUTH.md)
for session and authorization details.
