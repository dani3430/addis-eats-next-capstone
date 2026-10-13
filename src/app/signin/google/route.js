import crypto from "node:crypto";
import { NextResponse } from "next/server";

const STATE_COOKIE = "google_oauth_state";
const VERIFIER_COOKIE = "google_oauth_verifier";
const NEXT_COOKIE = "google_oauth_next";
const OAUTH_COOKIE_MAX_AGE = 600;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/signin/google/callback",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };
}

export async function GET(request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(signInUrl);
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const next = request.nextUrl.searchParams.get("next");
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", new URL("/signin/google/callback", process.env.SITE_URL ?? request.nextUrl.origin).toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  const options = cookieOptions();
  response.cookies.set(STATE_COOKIE, state, options);
  response.cookies.set(VERIFIER_COOKIE, verifier, options);
  response.cookies.set(NEXT_COOKIE, next ?? "/", options);
  return response;
}
