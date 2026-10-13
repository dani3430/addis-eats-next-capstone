"use client";

import { useState } from "react";
import { useCart } from "./Providers";
export default function AddToCartButton({ dish }) {
  const { items, dispatch } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = items.find((item) => item.id === dish.id)?.qty ?? 0;

  function handleClick() {
    dispatch({ type: "add", dish });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white shadow-sm transition active:scale-95 ${
        justAdded ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
      }`}
    >
      {justAdded
        ? "Added ✓"
        : inCart > 0
        ? `Add another (${inCart} in cart)`
        : "Add to order"}
    </button>
  );
}