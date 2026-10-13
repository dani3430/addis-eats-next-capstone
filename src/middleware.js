import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

export function middleware(request) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Narrow on purpose: middleware runs on every matching request,
// so only the paths that actually need protection are listed here.
export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*"],
};