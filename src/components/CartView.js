"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./Providers";
import { cartTotal } from "@/lib/cart";
import { etb } from "@/lib/format";

export default function CartView() {
  const { items, loaded, dispatch } = useCart();
  const router = useRouter();

  if (!loaded) {
    return (
      <div className="rounded-xl border border-amber-200 bg-white p-8 text-center text-stone-500">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-amber-300 bg-white p-10 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 font-medium text-stone-700">Your cart is empty.</p>
        <Link
          href="/menu"
          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-amber-600 px-5 py-2 font-semibold text-white transition hover:bg-amber-700"
        >
          Browse the menu <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  // The cart only leaves the browser here, as ids and quantities.
  function goToCheckout() {
    const payload = encodeURIComponent(
      JSON.stringify(items.map(({ id, qty }) => ({ id, qty })))
    );
    document.cookie = `addis-cart=${payload}; path=/; max-age=3600; samesite=lax`;
    router.push("/checkout");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
      <ul className="divide-y divide-amber-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 p-4 transition hover:bg-amber-50/60 sm:p-5"
          >
            <div className="min-w-[10rem]">
              <p className="font-semibold text-stone-900">{item.name}</p>
              <p className="text-sm text-stone-500">{etb(item.price)} each</p>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-amber-300 p-1">
              <button
                type="button"
                aria-label={`Decrease ${item.name}`}
                onClick={() => dispatch({ type: "decrement", id: item.id })}
                className="flex h-8 w-8 items-center justify-center rounded-md font-bold text-amber-700 transition hover:bg-amber-100"
              >
                −
              </button>
              <span
                className="w-8 text-center font-medium tabular-nums"
                aria-live="polite"
              >
                {item.qty}
              </span>
              <button
                type="button"
                aria-label={`Increase ${item.name}`}
                onClick={() => dispatch({ type: "increment", id: item.id })}
                className="flex h-8 w-8 items-center justify-center rounded-md font-bold text-amber-700 transition hover:bg-amber-100"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-24 text-right font-semibold tabular-nums">
                {etb(item.price * item.qty)}
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "remove", id: item.id })}
                className="rounded-md px-2 py-1 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-amber-200 bg-amber-50/50 p-5">
        <p className="text-lg font-bold">
          Total: <span className="text-amber-700">{etb(cartTotal(items))}</span>
        </p>
        <button
          type="button"
          onClick={goToCheckout}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
        >
          Proceed to checkout <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}