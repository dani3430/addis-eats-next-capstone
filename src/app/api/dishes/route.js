import { NextResponse } from "next/server";
import { getDishes, PAGE_SIZE } from "@/lib/dishes";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const category = searchParams.get("category") ?? "All";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const all = await getDishes();

  let filtered = all;
  if (category !== "All") {
    filtered = filtered.filter((dish) => dish.category === category);
  }
  if (q) {
    filtered = filtered.filter((dish) =>
      `${dish.name} ${dish.category} ${dish.description}`.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * PAGE_SIZE;
  const dishes = filtered.slice(start, start + PAGE_SIZE);

  return NextResponse.json({
    dishes,
    page,
    pageSize: PAGE_SIZE,
    total: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
  });
}