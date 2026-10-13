"use client";

import Link from "next/link";

export default function OrdersError({ reset }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-6">
      <h2 className="text-lg font-bold text-red-800">We couldn&apos;t load your orders</h2>
      <p className="mt-1 text-sm text-red-700">
        Something went wrong on our side. Your orders are safe. Try again in a moment.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
        <Link href="/orders" className="text-sm font-medium text-red-800 underline">
          Back to your orders
        </Link>
      </div>
    </div>
  );
}