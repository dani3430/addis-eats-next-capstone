import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

const STATE_COOKIE = "google_oauth_state";
const VERIFIER_COOKIE = "google_oauth_verifier";
const NEXT_COOKIE = "google_oauth_next";

function safeNext(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

function matchesState(expected, actual) {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function clearOAuthCookies(response) {
  for (const name of [STATE_COOKIE, VERIFIER_COOKIE, NEXT_COOKIE]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/signin/google/callback",
      maxAge: 0,
    });
  }
  return response;
}

function redirectToSignIn(request, error) {
  const url = new URL("/signin", request.url);
  url.searchParams.set("error", error);
  return clearOAuthCookies(NextResponse.redirect(url));
}

export async function GET(request) {
  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  const verifier = jar.get(VERIFIER_COOKIE)?.value;
  const next = safeNext(jar.get(NEXT_COOKIE)?.value);
  const { searchParams } = request.nextUrl;

  if (searchParams.has("error") || !matchesState(expectedState, searchParams.get("state"))) {
    return redirectToSignIn(request, "google_failed");
  }

  const code = searchParams.get("code");
  if (!code || !verifier || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectToSignIn(request, "google_failed");
  }

  const redirectUri = new URL("/signin/google/callback", process.env.SITE_URL ?? request.nextUrl.origin).toString();
  let tokenResponse;
  let tokens;
  try {
    tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) {
      console.error("Google OAuth token exchange failed with status", tokenResponse.status);
      return redirectToSignIn(request, "google_failed");
    }
    tokens = await tokenResponse.json();
  } catch (error) {
    console.error("Google OAuth token exchange request failed", error);
    return redirectToSignIn(request, "google_failed");
  }

  if (typeof tokens.access_token !== "string") {
    console.error("Google OAuth token exchange returned no access token");
    return redirectToSignIn(request, "google_failed");
  }

  let profileResponse;
  let profile;
  try {
    profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!profileResponse.ok) {
      console.error("Google OAuth userinfo request failed with status", profileResponse.status);
      return redirectToSignIn(request, "google_failed");
    }
    profile = await profileResponse.json();
  } catch (error) {
    console.error("Google OAuth userinfo request failed", error);
    return redirectToSignIn(request, "google_failed");
  }

  if (
    typeof profile.sub !== "string"
    || typeof profile.email !== "string"
    || profile.email_verified !== true
  ) {
    console.error("Google OAuth returned an incomplete or unverified user profile");
    return redirectToSignIn(request, "google_failed");
  }

  const user = {
    id: `google_${profile.sub}`,
    name: typeof profile.name === "string" && profile.name.trim()
      ? profile.name.trim()
      : profile.email,
    role: "customer",
  };
  const response = clearOAuthCookies(NextResponse.redirect(new URL(next, request.url)));
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
