"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByPhone, verifyPassword } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// Only a same-site path is ever allowed. Rejects "https://evil.com"
// and the protocol-relative "//evil.com" alike — both would otherwise
// send a signed-in user straight off the site.
function safeNext(next) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export async function signIn(prevState, formData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/"));

  const user = findUserByPhone(phone);
  if (!user || !verifyPassword(user, password)) {
    return {
      ok: false,
      message: "Incorrect phone number or password.",
      values: { phone },
    };
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect(next);
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/");
}