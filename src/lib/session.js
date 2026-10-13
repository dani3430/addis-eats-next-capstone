import { cookies } from "next/headers";
import crypto from "node:crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./session-constants";

const SECRET = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !SECRET) {
  throw new Error("SESSION_SECRET must be set in production.");
}
const SESSION_SIGNING_SECRET = SECRET ?? "dev-secret-change-me";

export { SESSION_COOKIE, SESSION_MAX_AGE };

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SESSION_SIGNING_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token) {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = crypto
    .createHmac("sha256", SESSION_SIGNING_SECRET)
    .update(body)
    .digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  // Constant-time comparison, so checking a signature can't leak timing information.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Called once, at sign-in.
export function createSessionToken(user) {
  return signPayload({
    sub: user.id,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}

// The one helper used everywhere: a page that renders, an action that
// writes, and a handler that answers all read the session this same way.
export async function getSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return { id: payload.sub, name: payload.name, role: payload.role };
}