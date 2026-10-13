import { NextResponse } from "next/server";
import { getOwnedOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();

  const result = getOwnedOrder(id, session?.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ order: result.order });
}