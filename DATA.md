# Data model and flow

## Where data lives

| Data | Source / lifetime | Trust and privacy boundary |
| --- | --- | --- |
| Dishes and prices | `src/lib/dishes.js`; server module | Server looks up prices at checkout. Treat this in-memory list as demo catalog data. |
| Cart | Browser `localStorage` through `Providers` | Client sends dish ids and quantities; client prices are not trusted. |
| Favorites | Browser `localStorage` through `Providers` | Key is browser-wide, not user/account scoped or synchronized. |
| Demo accounts | `src/lib/users.js`; server module | Hard-coded fixtures with demo passwords; not production identity storage. |
| Orders | `src/lib/orders.js`; process-memory `Map` | Lost on process restart and not shared across serverless instances. |
| Order idempotency | Process-memory map in `src/lib/orders.js` | Prevents duplicate submits within one running process only. |
| Session | Signed cookie using `SESSION_SECRET` | Cookie is httpOnly; server verifies signature and expiry. |
| Dashboard aggregates | Calculated on the server from order store | Revenue and order counts exclude cancelled orders. |
| Staff order rows/export | Server projection after staff-role check | Contains customer contact and delivery details; do not expose in customer APIs. |

## Checkout lifecycle

1. The browser stores cart dish ids and quantities.
2. The checkout form submits customer details, ids, quantities, and an
   idempotency key to the server action.
3. `validateOrder()` validates customer fields, neighbourhood, item count, dish
   id type, and quantity bounds.
4. The server loads every dish from its catalog, uses catalog prices, computes
   the total, attaches the verified session's user id, timestamps the order,
   and places it in the in-memory store.
5. The customer sees only their own orders. The staff projection is a separate
   function with additional name/phone fields and is only used after staff
   authorization.

The form disables submission while pending and reuses its idempotency key.
`createOrder()` coalesces the same user's repeated key in this process. This
does not provide cross-instance or durable idempotency; production should use
a database transaction and unique constraint on the checkout attempt key.

## Status, cancellation, and tracking

The stored order has a creation time and cancellation state. For presentation,
`deriveStatus()` calculates delivery progress from elapsed time: Received for
the first 10 seconds, Preparing until 30 seconds, On the way until 90 seconds,
then Delivered. The courier location is interpolated between fixed demo
coordinates. The tracking stream sends updates and the UI can fall back to
polling.

Staff cancellation sets `status` to `cancelled` and keeps the order in history.
Cancelled orders are excluded from revenue and the active kitchen queue.
However, because the store is in memory, neither the order nor cancellation is
durable.

The timeline and map are simulated for a presentation. They do not represent a
real courier, GPS feed, kitchen status update, or guaranteed 90-second
delivery. Do not promise this timing to customers.

## Exports and privacy

- `/api/orders/export` returns only the authenticated customer's orders.
- `/api/staff/orders/export` requires a staff session and exports all staff
  fields as UTF-8 CSV with a BOM for Excel compatibility.
- CSV values are escaped by `src/lib/csv.js`, including spreadsheet-formula
  prefixes.
- Customer-facing order responses use `publicOrder()`; staff name and phone
  fields come from `getOrdersForStaff()` and are not part of that projection.

These checks reduce accidental exposure, but production still needs durable
storage, access logging, retention rules, and a privacy policy appropriate to
real customer contact and address data.
