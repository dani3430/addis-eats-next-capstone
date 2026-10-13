import { NextResponse } from "next/server";
import { getDish } from "@/lib/dishes";

export async function GET(request, { params }) {
  const { id } = await params;
  const dish = await getDish(id);

  if (!dish) {
    return NextResponse.json({ error: `Dish "${id}" not found` }, { status: 404 });
  }
  return NextResponse.json(dish);
}