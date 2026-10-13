import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getDish } from "@/lib/dishes";
import { getSession } from "@/lib/session";
import { etb } from "@/lib/format";
export const metadata = {
  title: "Checkout",
  description: "Confirm your order and place it with Addis Eats.",
};
function parseCart(raw) {
  for (const candidate of [raw, safeDecode(raw)]) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // try the next candidate
    }
  }
  return [];
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

export default async function CheckoutPage() {
  // Reading a cookie makes this route dynamic, and that is correct.
    // Page-level check: not only middleware. This also makes the
  // route dynamic, correctly, since it depends on who's asking.
  const session = await getSession();
  if (!session) {
    redirect("/signin?next=/checkout");
  }
  const jar = await cookies();
  const cart = parseCart(jar.get("addis-cart")?.value ?? "[]");

  // Prices always come from the server's own data.
  const lines = [];
  for (const { id, qty } of cart) {
    const dish = await getDish(id);
    if (dish && Number.isInteger(qty) && qty > 0) {
      lines.push({ id: dish.id, name: dish.name, price: dish.price, qty });
    }
  }

  // The guard: no cart, no checkout.
  if (lines.length === 0) {
    redirect("/cart");
  }

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

    return (
    <section className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="mb-5 text-2xl font-bold">Checkout</h1>
        <CheckoutForm items={lines.map(({ id, qty }) => ({ id, qty }))} />
      </div>

      <aside className="h-fit rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-800">Order summary</h2>
        <ul className="divide-y divide-amber-100 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between py-2">
              <span>
                {line.qty} × {line.name}
              </span>
              <span className="font-medium tabular-nums">{etb(line.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-amber-200 pt-3 text-lg font-bold">
          <span>Total</span>
          <span className="text-amber-700">{etb(total)}</span>
        </p>
      </aside>
    </section>
  );
}