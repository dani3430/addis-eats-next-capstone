# Authentication and authorization

This is a teaching demo. It demonstrates signed sessions and server-side access
checks, but its public demo credentials and in-memory order data are not a
production identity system.

## Sign-in and session

Demo users are defined in `src/lib/users.js`. Password hashes are generated
with `bcryptjs` from the demo passwords in the source. The sign-in action checks
the phone/password pair and issues an HMAC-signed session token.

The token is stored in an `httpOnly`, `sameSite=lax` cookie; it is marked
`secure` in production and has a finite lifetime. `getSession()` verifies the
signature and expiry before returning the user's id, name, and role.
`SESSION_SECRET` is mandatory in production; a missing secret throws rather
than falling back to a development key.

The sign-in `next` destination is restricted to a same-site path by
`safeNext()`, preventing an external or protocol-relative redirect.

## Optional Google sign-in

Google sign-in is an optional OAuth 2.0 authorization-code flow with PKCE. The
server creates short-lived, HTTP-only state, verifier, and return-path cookies;
the callback checks the state, exchanges the code on the server, and obtains
the profile from Google's OpenID Connect userinfo endpoint. Only profiles with
a verified email are accepted. Google users receive the customer role and the
same signed session cookie as demo users. The demo accounts remain available
without Google credentials.

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local` and in the
deployment's server-side environment. In Google Cloud Console, configure the
authorized redirect URI as
`http://localhost:3000/signin/google/callback` for local development and
`https://your-deployed-host/signin/google/callback` for the deployed app. The
host must match `SITE_URL`. Never use a `NEXT_PUBLIC_` prefix or commit the
client secret. If credentials are absent, the sign-in page shows a setup
message and demo sign-in continues to work.

## Authorization map

| Surface | Required check |
| --- | --- |
| `/checkout`, `placeOrder` | Valid session; action checks again at submission |
| `POST /api/orders` | Valid session; owner id comes from the session, not request data |
| `/orders` | Valid session; query is filtered to that session id |
| `/orders/[id]`, order status, and tracking stream | Valid session and matching order owner |
| Customer `cancelOrder` action | Valid session, matching owner, and cancellable status |
| `/dashboard`, `/kitchen` | Valid session and `role === "staff"` |
| `cancelStaffOrder` | Valid session and staff role; order id is looked up server-side |
| `GET /api/staff/orders/export` | Valid session and staff role |
| `/menu`, `/menu/[id]`, `/cart`, `/favorites` | Public; cart and favorites are browser-local |

`src/middleware.js` covers `/checkout` and `/orders`. It only tests for the
presence of a session cookie so it can redirect signed-out visitors. A cookie
can be invalid or expired; middleware is not an authorization boundary.
Protected pages, actions, and API handlers must keep using `getSession()` and
perform the relevant authorization check themselves. The middleware does not
cover `/api`.

## Three attacks to explain and demonstrate

These are presentation test cases and expected defenses, not a claim that every
attack was re-run against the deployed site.

1. **Unauthenticated access:** request `/orders` or `POST /api/orders` without a
   session. The page should send the visitor to sign-in; the API should return
   `401`. A cookie-presence redirect alone must never authorize the request.
2. **Horizontal or vertical privilege escalation:** as Customer A, request
   Customer B's order id; then try `/dashboard` or
   `/api/staff/orders/export` as a customer. The order lookup compares the
   order's owner id with the verified session id; staff surfaces check the
   staff role. The staff CSV handler returns `403` for a signed-in customer.
3. **Client-side price tampering:** alter the cart price or send a forged total.
   Checkout submits dish ids and quantities; the server validates the order,
   looks up each current dish price, and calculates the total itself. Client
   totals are not authoritative.

For the presentation, show the attempted request and the refusal/redirect, then
point to the corresponding server-side check. Do not expose real customer data
or secrets while screen sharing.

## Limits and next steps

- Demo credentials are visible in the sign-in UI and source. Replace the
  account store and credential lifecycle before public use.
- Google identities are not persisted in a user database; the signed session
  uses the Google subject as the user id. Google sign-in does not create staff
  accounts or grant staff privileges.
- There is no database-backed revocation, password reset, rate limiting, MFA,
  or account recovery.
- Favorites and cart are per-browser storage, not per-account data.
- Order data is in process memory; ownership checks cannot compensate for
  non-durable, non-shared storage.

Environment setup is documented in [README.md](./README.md).
