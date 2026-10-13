import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";

export async function POST(request) {
  // Authentication: the same helper the pages and actions use.
  // Middleware does not cover /api/orders, so this check is the only layer here.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  // The owner comes from the session, never from the request.
  const result = await createOrder(body, session.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: result.fieldErrors },
      { status: result.status }
    );
  }
  return NextResponse.json({ order: result.order }, { status: 201 });
}