"use client";

import { useCart } from "./Providers";

export default function CartBadge() {
  const { items, loaded } = useCart();
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  // Wait until the saved cart has loaded, so the server and the first client render match.
  if (!loaded || count === 0) {
    return null;
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-stone-800 px-1.5 text-xs font-bold text-white"
      >
        {count}
      </span>
      <span className="sr-only">{count === 1 ? "1 item in cart" : `${count} items in cart`}</span>
    </>
  );
}